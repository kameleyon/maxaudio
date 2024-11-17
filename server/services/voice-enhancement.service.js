const { OpenAI } = require('openai');
const { Elevenlabs } = require('elevenlabs-node');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

class VoiceEnhancementService {
    constructor() {
        // Initialize OpenAI for emotion analysis
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Initialize ElevenLabs for enhanced voices
        this.elevenLabs = new Elevenlabs({
            apiKey: process.env.ELEVENLABS_API_KEY
        });

        // Initialize Google TTS as fallback
        try {
            const credentials = require('../google-credentials.json');
            this.googleTTS = new TextToSpeechClient({
                credentials,
                projectId: credentials.project_id
            });
        } catch (error) {
            console.error('Error initializing Google TTS:', error);
        }
    }

    /**
     * Analyze text emotion using OpenAI
     */
    async analyzeEmotion(text) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: `Analyze the emotional content of the following text. 
                             Return a JSON object with:
                             - primaryEmotion (e.g., happy, sad, excited, calm)
                             - intensity (0-1)
                             - suggestedVoiceSettings (stability, similarity_boost, speaking_rate)`
                }, {
                    role: "user",
                    content: text
                }]
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error analyzing emotion:', error);
            return {
                primaryEmotion: 'neutral',
                intensity: 0.5,
                suggestedVoiceSettings: {
                    stability: 0.71,
                    similarity_boost: 0.5,
                    speaking_rate: 1.0
                }
            };
        }
    }

    /**
     * Generate enhanced speech using ElevenLabs
     */
    async generateEnhancedSpeech(text, voiceId = "josh") {
        try {
            // Analyze emotion first
            const emotion = await this.analyzeEmotion(text);
            console.log('Emotion analysis:', emotion);

            // Generate speech with ElevenLabs
            const audioContent = await this.elevenLabs.generate({
                text,
                voice_id: voiceId,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: emotion.suggestedVoiceSettings.stability,
                    similarity_boost: emotion.suggestedVoiceSettings.similarity_boost,
                    speaking_rate: emotion.suggestedVoiceSettings.speaking_rate
                }
            });

            return {
                audioContent,
                emotion
            };
        } catch (error) {
            console.error('Error generating enhanced speech:', error);
            // Fall back to Google TTS
            return this.fallbackToGoogleTTS(text, emotion);
        }
    }

    /**
     * Fallback to Google TTS with emotion-enhanced SSML
     */
    async fallbackToGoogleTTS(text, emotion) {
        try {
            const ssml = this.generateEmotionalSSML(text, emotion);
            
            const request = {
                input: { ssml },
                voice: {
                    languageCode: 'en-US',
                    name: 'en-US-Neural2-D',
                    ssmlGender: 'MALE'
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    pitch: this.getEmotionalPitch(emotion),
                    speakingRate: emotion.suggestedVoiceSettings.speaking_rate,
                    effectsProfileId: ['telephony-class-application']
                }
            };

            const [response] = await this.googleTTS.synthesizeSpeech(request);
            return {
                audioContent: response.audioContent,
                emotion
            };
        } catch (error) {
            console.error('Error in Google TTS fallback:', error);
            throw error;
        }
    }

    /**
     * Generate emotional SSML based on analyzed emotion
     */
    generateEmotionalSSML(text, emotion) {
        let ssml = '<speak>';

        switch (emotion.primaryEmotion) {
            case 'happy':
                ssml += `<prosody rate="${100 + (emotion.intensity * 20)}%" pitch="+${emotion.intensity * 2}st">`;
                break;
            case 'sad':
                ssml += `<prosody rate="${100 - (emotion.intensity * 10)}%" pitch="-${emotion.intensity * 2}st">`;
                break;
            case 'excited':
                ssml += `<prosody rate="${100 + (emotion.intensity * 30)}%" pitch="+${emotion.intensity * 3}st">`;
                break;
            case 'calm':
                ssml += `<prosody rate="${100 - (emotion.intensity * 5)}%" pitch="-${emotion.intensity}st">`;
                break;
            default:
                ssml += '<prosody rate="100%" pitch="0st">';
        }

        ssml += text;
        ssml += '</prosody></speak>';
        return ssml;
    }

    /**
     * Get emotional pitch adjustment
     */
    getEmotionalPitch(emotion) {
        const pitchMap = {
            happy: 2,
            sad: -2,
            excited: 4,
            calm: -1,
            neutral: 0
        };

        return (pitchMap[emotion.primaryEmotion] || 0) * emotion.intensity;
    }

    /**
     * Get available ElevenLabs voices
     */
    async getVoices() {
        try {
            return await this.elevenLabs.getVoices();
        } catch (error) {
            console.error('Error getting ElevenLabs voices:', error);
            // Fall back to Google TTS voices
            const [response] = await this.googleTTS.listVoices({});
            return response.voices;
        }
    }
}

module.exports = new VoiceEnhancementService();
