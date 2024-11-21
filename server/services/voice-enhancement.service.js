const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

class VoiceEnhancementService {
    constructor() {
        // Initialize Google TTS
        try {
            const credentials = require('../google-credentials.json');
            this.googleTTS = new TextToSpeechClient({
                credentials,
                projectId: credentials.project_id
            });
            console.log('Successfully initialized TextToSpeechClient');
        } catch (error) {
            console.error('Error initializing Google TTS:', error);
        }

        // Voice enhancement settings
        this.settings = {
            defaultStability: 0.71,
            defaultSimilarityBoost: 0.5,
            defaultSpeakingRate: 1.0
        };
    }

    /**
     * Generate emotional SSML based on tone
     */
    generateEmotionalSSML(text, tone = 'neutral') {
        let ssml = '<speak xmlns="http://www.w3.org/2001/10/synthesis" version="1.0">';

        switch (tone.toLowerCase()) {
            case 'happy':
                ssml += '<prosody rate="110%" pitch="+2st">';
                break;
            case 'sad':
                ssml += '<prosody rate="90%" pitch="-2st">';
                break;
            case 'excited':
                ssml += '<prosody rate="120%" pitch="+3st">';
                break;
            case 'calm':
                ssml += '<prosody rate="95%" pitch="-1st">';
                break;
            case 'professional':
                ssml += '<prosody rate="100%" pitch="+0.5st">';
                break;
            case 'casual':
                ssml += '<prosody rate="105%" pitch="+1st">';
                break;
            default:
                ssml += '<prosody rate="100%" pitch="0st">';
        }

        // Add natural pauses and emphasis
        text = text
            .replace(/([.!?])\s+/g, '$1<break time="750ms"/>')
            .replace(/([,;])\s+/g, '$1<break time="500ms"/>')
            .replace(/\n\n+/g, '<break time="1s"/>');

        ssml += text;
        ssml += '</prosody></speak>';
        return ssml;
    }

    /**
     * Generate speech with Google TTS
     */
    async generateSpeech(text, options = {}) {
        try {
            const ssml = this.generateEmotionalSSML(text, options.tone);
            
            const request = {
                input: { ssml },
                voice: {
                    languageCode: options.voice?.includes('GB') ? 'en-GB' : 'en-US',
                    name: options.voice || 'en-US-Neural2-D',
                    ssmlGender: options.gender?.toUpperCase() || 'NEUTRAL'
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    pitch: options.pitch || 0,
                    speakingRate: options.speakingRate || this.settings.defaultSpeakingRate,
                    effectsProfileId: ['telephony-class-application']
                }
            };

            console.log('Making TTS API request with:', request);
            const [response] = await this.googleTTS.synthesizeSpeech(request);
            return response.audioContent;
        } catch (error) {
            console.error('Error generating speech:', error);
            throw error;
        }
    }

    /**
     * Get available voices
     */
    async getVoices() {
        try {
            const [response] = await this.googleTTS.listVoices({});
            return response.voices
                .filter(voice => voice.languageCodes[0].startsWith('en-'))
                .map(voice => ({
                    id: voice.name,
                    name: `${voice.name.split('-').pop()} (${voice.languageCodes[0].split('-')[1]})`,
                    flag: voice.languageCodes[0].startsWith('en-GB') ? '🇬🇧' : '🇺🇸',
                    gender: voice.ssmlGender.charAt(0) + voice.ssmlGender.slice(1).toLowerCase(),
                    type: 'Google Neural'
                }));
        } catch (error) {
            console.error('Error getting voices:', error);
            return [];
        }
    }

    /**
     * Get emotional pitch adjustment
     */
    getEmotionalPitch(tone) {
        const pitchMap = {
            happy: 2,
            sad: -2,
            excited: 4,
            calm: -1,
            professional: 0.5,
            casual: 1,
            neutral: 0
        };

        return pitchMap[tone.toLowerCase()] || 0;
    }
}

module.exports = new VoiceEnhancementService();
