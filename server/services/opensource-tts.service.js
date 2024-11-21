const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const voiceEnhancement = require('./voice-enhancement.service');

class OpenSourceTTSService {
    constructor() {
        // Initialize paths
        this.modelsDir = path.join(__dirname, '../models');
        this.audioDir = path.join(__dirname, '../audios');
        this.tempDir = path.join(__dirname, '../temp');
        
        // Ensure directories exist on startup
        this.initializeDirs().catch(console.error);

        // Voice categories with specialized models for better quality
        this.voiceCategories = {
            'US English': [
                {
                    id: 'xtts-us-sarah',
                    name: 'Sarah (US)',
                    flag: '🇺🇸',
                    gender: 'Female',
                    type: 'FastPitch',
                    model: 'tts_models/en/ljspeech/fast_pitch',
                    language: 'en',
                    description: 'High-quality female voice with natural intonation'
                },
                {
                    id: 'xtts-us-michael',
                    name: 'Michael (US)',
                    flag: '🇺🇸',
                    gender: 'Male',
                    type: 'FastPitch',
                    model: 'tts_models/en/ljspeech/fast_pitch',
                    language: 'en',
                    pitch_shift: -0.3,  // Lower pitch for male voice
                    description: 'High-quality male voice with natural intonation'
                }
            ],
            'UK English': [
                {
                    id: 'xtts-uk-emma',
                    name: 'Emma (UK)',
                    flag: '🇬🇧',
                    gender: 'Female',
                    type: 'FastPitch',
                    model: 'tts_models/en/ljspeech/fast_pitch',
                    language: 'en',
                    pitch_shift: 0.1,  // Slightly higher pitch for female voice
                    description: 'High-quality British female voice'
                },
                {
                    id: 'xtts-uk-james',
                    name: 'James (UK)',
                    flag: '🇬🇧',
                    gender: 'Male',
                    type: 'FastPitch',
                    model: 'tts_models/en/ljspeech/fast_pitch',
                    language: 'en',
                    pitch_shift: -0.4,  // Lower pitch for male voice
                    description: 'High-quality British male voice'
                }
            ]
        };
    }

    async initializeDirs() {
        const dirs = [this.modelsDir, this.audioDir, this.tempDir];
        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`Directory created/verified: ${dir}`);
            } catch (error) {
                console.error(`Error creating directory ${dir}:`, error);
                throw error;
            }
        }
    }

    /**
     * Process text for natural speech markers
     */
    processTextMarkers(text) {
        // Add natural pauses
        text = text
            .replace(/([.!?])\s+/g, '$1<break time="750ms"/>')
            .replace(/([,;])\s+/g, '$1<break time="500ms"/>')
            .replace(/\.\.\./g, '<break time="1s"/><prosody rate="slow">hmm</prosody><break time="500ms"/>')
            .replace(/\(pause\)/g, '<break time="500ms"/>')
            .replace(/\(long pause\)/g, '<break time="1s"/>');

        // Process emotional markers
        text = text
            .replace(/\(happy\)(.*?)\)/g, '<prosody rate="110%" pitch="+2st">$1</prosody>')
            .replace(/\(sad\)(.*?)\)/g, '<prosody rate="90%" pitch="-2st">$1</prosody>')
            .replace(/\(excited\)(.*?)\)/g, '<prosody rate="120%" pitch="+3st">$1</prosody>')
            .replace(/\(calm\)(.*?)\)/g, '<prosody rate="95%" pitch="-1st">$1</prosody>')
            .replace(/\(thoughtful\)(.*?)\)/g, '<prosody rate="85%" pitch="-1st">$1</prosody>');

        // Process voice variations
        text = text
            .replace(/\(whisper\)(.*?)\)/g, '<prosody volume="soft" rate="90%">$1</prosody>')
            .replace(/\(soft\)(.*?)\)/g, '<prosody volume="soft">$1</prosody>')
            .replace(/\(loud\)(.*?)\)/g, '<prosody volume="loud">$1</prosody>');

        // Process emphasis
        text = text
            .replace(/\*\*(.*?)\*\*/g, '<emphasis level="strong">$1</emphasis>')
            .replace(/\*(.*?)\*/g, '<emphasis level="moderate">$1</emphasis>');

        return text;
    }

    /**
     * Generate speech using TTS engine
     */
    async generateSpeech(text, options = {}) {
        try {
            // Ensure directories exist before proceeding
            await this.initializeDirs();

            const voice = this.findVoice(options.voice);
            if (!voice) {
                throw new Error('Invalid voice selected');
            }

            // Process natural speech markers
            const processedText = this.processTextMarkers(text);
            const outputPath = path.join(this.audioDir, `audio_${Date.now()}.wav`);

            // Generate audio using appropriate model
            const audio = await this.generateWithModel(
                processedText,
                voice,
                outputPath
            );

            // Apply voice enhancement if needed
            if (options.tone) {
                return await voiceEnhancement.enhanceSpeech(audio, options.tone);
            }

            return audio;
        } catch (error) {
            console.error('TTS generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate speech with appropriate model
     */
    async generateWithModel(text, voice, outputPath) {
        return new Promise((resolve, reject) => {
            // Create Python script content with proper string escaping
            const pythonScript = `
import sys
from TTS.api import TTS

try:
    text = """${text.replace(/"/g, '\\"')}"""
    
    tts = TTS("${voice.model}")
    
    # Generate speech with appropriate parameters based on model type
    if "${voice.type}" == "VITS":
        tts.tts_to_file(
            text=text,
            file_path="${outputPath.replace(/\\/g, '\\\\')}",
            speaker_id="${voice.speaker_id}",
            language="${voice.language}"
        )
    else:
        tts.tts_to_file(
            text=text,
            file_path="${outputPath.replace(/\\/g, '\\\\')}"
        )
        
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
`;

            // Write temporary script
            const scriptPath = path.join(this.tempDir, `tts_script_${Date.now()}.py`);
            
            fs.writeFile(scriptPath, pythonScript)
                .then(() => {
                    console.log('Running TTS script:', scriptPath);
                    
                    const process = spawn('python', [scriptPath]);
                    
                    let stdout = '';
                    let stderr = '';

                    process.stdout.on('data', (data) => {
                        stdout += data;
                        console.log(`TTS stdout: ${data}`);
                    });

                    process.stderr.on('data', (data) => {
                        stderr += data;
                        console.error(`TTS stderr: ${data}`);
                    });

                    process.on('close', async (code) => {
                        try {
                            // Clean up script
                            await fs.unlink(scriptPath);

                            if (code === 0 && stdout.includes('SUCCESS')) {
                                // Read and return the generated audio
                                const audio = await fs.readFile(outputPath);
                                await fs.unlink(outputPath); // Clean up
                                resolve(audio);
                            } else {
                                reject(new Error(`TTS generation failed: ${stderr}`));
                            }
                        } catch (err) {
                            reject(err);
                        }
                    });

                    process.on('error', (err) => {
                        console.error('Failed to start TTS process:', err);
                        reject(err);
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Find voice configuration by ID
     */
    findVoice(voiceId) {
        for (const category of Object.values(this.voiceCategories)) {
            const voice = category.find(v => v.id === voiceId);
            if (voice) return voice;
        }
        return null;
    }

    /**
     * Get available voices
     */
    async getVoices() {
        return Object.values(this.voiceCategories).flat();
    }

    /**
     * Get voices by category
     */
    async getVoicesByCategory() {
        return this.voiceCategories;
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
