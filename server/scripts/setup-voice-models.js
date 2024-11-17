const path = require('path');
const fs = require('fs');
const https = require('follow-redirects').https;
const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');

const MODELS_DIR = path.join(__dirname, '../models');
const TEMP_DIR = path.join(__dirname, '../temp');
const REQUIREMENTS_FILE = path.join(__dirname, '../requirements.txt');
const PYTHON_PATH = path.join(__dirname, '../venv39/Scripts/python.exe');

// Model URLs and info
const MODELS = {
    coqui: {
        name: 'YourTTS Multilingual',
        modelPath: path.join(MODELS_DIR, 'coqui/tts_models--multilingual--multi-dataset--your_tts'),
        command: 'tts --text "Test." --model_name tts_models/multilingual/multi-dataset/your_tts --out_path test.wav'
    },
    piper: {
        name: 'Piper English Amy',
        url: 'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx',
        filename: 'en_US-amy-medium.onnx',
        modelPath: path.join(MODELS_DIR, 'piper')
    }
};

async function ensureDirectories() {
    console.log('Creating necessary directories...');
    if (!fs.existsSync(MODELS_DIR)) {
        fs.mkdirSync(MODELS_DIR, { recursive: true });
    }
    if (!fs.existsSync(path.join(MODELS_DIR, 'coqui'))) {
        fs.mkdirSync(path.join(MODELS_DIR, 'coqui'), { recursive: true });
    }
    if (!fs.existsSync(path.join(MODELS_DIR, 'piper'))) {
        fs.mkdirSync(path.join(MODELS_DIR, 'piper'), { recursive: true });
    }
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
}

async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => resolve());
                });
            } else {
                file.close();
                fs.unlink(destPath, () => {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                });
            }
        }).on('error', (err) => {
            fs.unlink(destPath, () => reject(err));
        });
    });
}

async function checkPythonVersion() {
    return new Promise((resolve, reject) => {
        const python = spawn(PYTHON_PATH, ['--version']);
        python.stdout.on('data', (data) => {
            const version = data.toString().match(/\d+\.\d+\.\d+/);
            if (version && parseFloat(version[0]) >= 3.7) {
                resolve(true);
            } else {
                reject(new Error('Python version must be 3.7 or higher'));
            }
        });
        python.stderr.on('data', (data) => {
            reject(new Error(data.toString()));
        });
    });
}

async function installPythonDependencies() {
    console.log('Installing Python dependencies...');
    return new Promise((resolve, reject) => {
        const pip = spawn(path.join(__dirname, '../venv39/Scripts/pip.exe'), ['install', '-r', REQUIREMENTS_FILE]);

        pip.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        pip.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        pip.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`pip install failed with code ${code}`));
            }
        });
    });
}

async function downloadPiperModel() {
    const modelPath = path.join(MODELS.piper.modelPath, MODELS.piper.filename);
    
    try {
        if (fs.existsSync(modelPath)) {
            console.log('Piper model already exists, skipping download...');
            return;
        }
        console.log('Downloading Piper model...');
        await downloadFile(MODELS.piper.url, modelPath);
        console.log('Piper model downloaded successfully');
    } catch (error) {
        console.error('Error downloading Piper model:', error);
        throw error;
    }
}

async function downloadCoquiModel() {
    console.log('Setting up Coqui TTS model...');
    return new Promise((resolve, reject) => {
        PythonShell.run('download_model.py', {
            scriptPath: __dirname,
            pythonPath: PYTHON_PATH,
            args: [MODELS.coqui.modelPath]
        }, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function testTTSInstallation() {
    console.log('Testing TTS installations...');

    // Test Coqui
    try {
        console.log('Testing Coqui TTS...');
        const testPath = path.join(TEMP_DIR, 'test_coqui.wav');
        await new Promise((resolve, reject) => {
            const tts = spawn(path.join(__dirname, '../venv39/Scripts/tts.exe'), [
                '--text', 'Test.',
                '--model_name', 'tts_models/multilingual/multi-dataset/your_tts',
                '--out_path', testPath
            ]);

            tts.stdout.on('data', (data) => {
                console.log(data.toString());
            });

            tts.stderr.on('data', (data) => {
                console.error(data.toString());
            });

            tts.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Coqui test failed with code ${code}`));
            });
        });
        console.log('Coqui TTS test successful');
    } catch (error) {
        console.error('Coqui TTS test failed:', error);
    }

    // Test Piper
    try {
        console.log('Testing Piper TTS...');
        const testPath = path.join(TEMP_DIR, 'test_piper.wav');
        await new Promise((resolve, reject) => {
            const piper = spawn('piper', [
                '--model', path.join(MODELS.piper.modelPath, MODELS.piper.filename),
                '--output_file', testPath
            ]);

            piper.stdin.write('Test.');
            piper.stdin.end();

            piper.stdout.on('data', (data) => {
                console.log(data.toString());
            });

            piper.stderr.on('data', (data) => {
                console.error(data.toString());
            });

            piper.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Piper test failed with code ${code}`));
            });
        });
        console.log('Piper TTS test successful');
    } catch (error) {
        console.error('Piper TTS test failed:', error);
    }
}

async function cleanup() {
    console.log('Cleaning up temporary files...');
    if (fs.existsSync(TEMP_DIR)) {
        const files = fs.readdirSync(TEMP_DIR);
        for (const file of files) {
            fs.unlinkSync(path.join(TEMP_DIR, file));
        }
    }
}

async function main() {
    try {
        console.log('Starting voice models setup...');
        
        // Check Python version
        await checkPythonVersion();
        console.log('Python version check passed');

        // Create directories
        await ensureDirectories();
        console.log('Directories created successfully');

        // Install Python dependencies
        await installPythonDependencies();
        console.log('Python dependencies installed successfully');

        // Download models
        await Promise.all([
            downloadPiperModel(),
            downloadCoquiModel()
        ]);
        console.log('Models downloaded successfully');

        // Test installations
        await testTTSInstallation();

        // Cleanup
        await cleanup();
        
        console.log('\nSetup completed successfully!');
        console.log('\nAvailable voices:');
        console.log('1. Coqui YourTTS Multilingual');
        console.log('2. Piper English Amy');
        
    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}

// Run setup
main();
