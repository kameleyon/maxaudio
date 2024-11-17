const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class OpenSourceTTSService {
    constructor() {
        // Initialize paths
        this.modelsDir = path.join(__dirname, '../models');
        this.audioDir = path.join(__dirname, '../audios');
        this.tempDir = path.join(__dirname, '../temp');
        
        // Ensure directories exist
        this.initializeDirs();
    }

    async initializeDirs() {
        const dirs = [this.modelsDir, this.audioDir, this.tempDir];
        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
            } catch (error) {
                console.error(`Error creating directory ${dir}:`, error);
            }
        }
    }

    /**
     * Primary TTS using Coqui YourTTS
     */
    async generateWithCoqui(text, options = {}) {
        const outputPath = path.join(this.audioDir, `audio_${Date.now()}.wav`);
        
        return new Promise((resolve, reject) => {
            // Use Python subprocess to run Coqui TTS
            const process = spawn('python', [
                '-m', 'TTS.bin.synthesize',
                '--text', text,
                '--model_name', 'tts_models/multilingual/multi-dataset/your_tts',
                '--out_path', outputPath,
                '--speaker_idx', options.speaker || '0',
                '--language_idx', options.language || 'en'
            ]);

            let error = '';
            process.stderr.on('data', (data) => {
                error += data;
            });

            process.on('close', async (code) => {
                if (code === 0) {
                    try {
                        const audio = await fs.readFile(outputPath);
                        await fs.unlink(outputPath); // Clean up
                        resolve(audio);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(new Error(`Coqui TTS failed: ${error}`));
                }
            });
        });
    }

    /**
     * Backup TTS using Piper
     */
    async generateWithPiper(text, options = {}) {
        const outputPath = path.join(this.audioDir, `audio_${Date.now()}.wav`);
        
        // Add SSML markers for natural speech
        const markedText = this.addNaturalMarkers(text);

        return new Promise((resolve, reject) => {
            const process = spawn('piper', [
                '--model', path.join(this.modelsDir, 'en_US-amy-medium.onnx'),
                '--output_file', outputPath
            ]);

            process.stdin.write(markedText);
            process.stdin.end();

            let error = '';
            process.stderr.on('data', (data) => {
                error += data;
            });

            process.on('close', async (code) => {
                if (code === 0) {
                    try {
                        const audio = await fs.readFile(outputPath);
                        await fs.unlink(outputPath); // Clean up
                        resolve(audio);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(new Error(`Piper TTS failed: ${error}`));
                }
            });
        });
    }

    /**
     * Add natural speech markers using SSML
     */
    addNaturalMarkers(text) {
        let ssml = '<speak>';

        // Split into sentences
        const sentences = text.split(/([.!?]+)/);

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            
            // Skip empty sentences
            if (!sentence.trim()) continue;

            // Add prosody based on punctuation
            if (sentence.includes('?')) {
                ssml += `<prosody pitch="+15%" rate="95%">${sentence}</prosody>`;
            } else if (sentence.includes('!')) {
                ssml += `<prosody pitch="+10%" rate="110%">${sentence}</prosody>`;
            } else if (sentence.includes('.')) {
                ssml += `${sentence}<break time="500ms"/>`;
            } else if (sentence.includes(',')) {
                ssml += `${sentence}<break time="200ms"/>`;
            } else {
                ssml += sentence;
            }

            // Add natural pauses between sentences
            if (i < sentences.length - 1) {
                ssml += '<break time="300ms"/>';
            }
        }

        ssml += '</speak>';
        return ssml;
    }

    /**
     * Main generate function with fallback
     */
    async generateSpeech(text, options = {}) {
        try {
            // Try Coqui first
            console.log('Attempting to generate speech with Coqui YourTTS...');
            return await this.generateWithCoqui(text, options);
        } catch (error) {
            console.error('Coqui TTS failed, falling back to Piper:', error);
            try {
                // Fallback to Piper
                return await this.generateWithPiper(text, options);
            } catch (piperError) {
                console.error('Piper TTS also failed:', piperError);
                throw new Error('All TTS engines failed');
            }
        }
    }

    /**
     * Get available voices
     */
    async getVoices() {
        // Return a list of available voices from both engines
        return [
            {
                id: 'coqui-en-female',
                name: 'Coqui English Female',
                language: 'en',
                engine: 'coqui'
            },
            {
                id: 'coqui-en-male',
                name: 'Coqui English Male',
                language: 'en',
                engine: 'coqui'
            },
            {
                id: 'piper-amy',
                name: 'Piper Amy',
                language: 'en',
                engine: 'piper'
            }
            // Add more voices as they become available
        ];
    }

    /**
     * Clean up temporary files
     */
    async cleanup() {
        try {
            const files = await fs.readdir(this.tempDir);
            await Promise.all(
                files.map(file => 
                    fs.unlink(path.join(this.tempDir, file))
                )
            );
        } catch (error) {
            console.error('Error cleaning up temp files:', error);
        }
    }
}

module.exports = new OpenSourceTTSService();
