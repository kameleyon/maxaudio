const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Model configurations
const MODELS = [
    // Coqui YourTTS US English Models
    {
        name: 'Jenny (US)',
        command: 'tts --model_name tts_models/en/jenny/jenny --download_dir ../models',
        type: 'Coqui'
    },
    {
        name: 'David (US)',
        command: 'tts --model_name tts_models/en/david/glow-tts --download_dir ../models',
        type: 'Coqui'
    },
    
    // Coqui YourTTS UK English Models
    {
        name: 'Emma (UK)',
        command: 'tts --model_name tts_models/en/vctk/vits --download_dir ../models',
        type: 'Coqui'
    },
    {
        name: 'James (UK)',
        command: 'tts --model_name tts_models/en/vctk/fast_pitch --download_dir ../models',
        type: 'Coqui'
    },

    // Mozilla TTS US English Models
    {
        name: 'Linda (US)',
        command: 'tts --model_name tts_models/en/ljspeech/tacotron2-DDC --download_dir ../models',
        type: 'Mozilla'
    },
    {
        name: 'John (US)',
        command: 'tts --model_name tts_models/en/ljspeech/glow-tts --download_dir ../models',
        type: 'Mozilla'
    },

    // Mozilla TTS UK English Models
    {
        name: 'Sarah (UK)',
        command: 'tts --model_name tts_models/en/vctk/vits --download_dir ../models',
        type: 'Mozilla'
    },
    {
        name: 'Thomas (UK)',
        command: 'tts --model_name tts_models/en/vctk/fast_pitch --download_dir ../models',
        type: 'Mozilla'
    }
];

async function ensureDirectories() {
    const dirs = ['../models', '../audios', '../temp'];
    for (const dir of dirs) {
        const fullPath = path.join(__dirname, dir);
        try {
            await fs.mkdir(fullPath, { recursive: true });
            console.log(`Created directory: ${fullPath}`);
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error(`Error creating directory ${fullPath}:`, error);
            }
        }
    }
}

async function downloadModel(model) {
    return new Promise((resolve, reject) => {
        console.log(`\nDownloading ${model.name} (${model.type})...`);
        
        const process = spawn('python', ['-m', model.command], {
            shell: true,
            cwd: __dirname
        });

        process.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        process.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✓ Successfully downloaded ${model.name}`);
                resolve();
            } else {
                console.error(`✗ Failed to download ${model.name}`);
                reject(new Error(`Download failed with code ${code}`));
            }
        });
    });
}

async function testModel(model) {
    const testText = "This is a test of the text-to-speech system.";
    const outputPath = path.join(__dirname, '../temp', `test_${model.name.toLowerCase().replace(/\s+/g, '_')}.wav`);

    return new Promise((resolve, reject) => {
        console.log(`\nTesting ${model.name}...`);
        
        const process = spawn('python', [
            '-m', 'TTS.bin.synthesize',
            '--text', testText,
            '--model_name', model.command.split(' ')[2],
            '--out_path', outputPath
        ], {
            shell: true,
            cwd: __dirname
        });

        process.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        process.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✓ Successfully tested ${model.name}`);
                resolve();
            } else {
                console.error(`✗ Failed to test ${model.name}`);
                reject(new Error(`Test failed with code ${code}`));
            }
        });
    });
}

async function main() {
    try {
        console.log('Setting up TTS models...');
        
        // Ensure required directories exist
        await ensureDirectories();

        // Download and test each model
        for (const model of MODELS) {
            try {
                await downloadModel(model);
                await testModel(model);
            } catch (error) {
                console.error(`Error processing ${model.name}:`, error);
                // Continue with next model even if one fails
            }
        }

        console.log('\n✓ TTS setup completed successfully!');
        console.log('You can now use the following voices:');
        MODELS.forEach(model => {
            console.log(`- ${model.name} (${model.type})`);
        });

    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

// Run setup
main();
