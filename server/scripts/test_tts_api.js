const openSourceTTS = require('../services/opensource-tts.service');
const fs = require('fs').promises;
const path = require('path');

async function testVoice(voiceId, text) {
    try {
        console.log(`\nTesting voice: ${voiceId}`);
        console.log('Text:', text);

        const audio = await openSourceTTS.generateSpeech(text, {
            voice: voiceId
        });

        // Save the audio for verification
        const outputDir = path.join(__dirname, '../test_output');
        await fs.mkdir(outputDir, { recursive: true });
        
        const outputPath = path.join(outputDir, `test_api_${voiceId}.wav`);
        await fs.writeFile(outputPath, audio);
        
        console.log(`✓ Successfully generated audio: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`✗ Error testing voice ${voiceId}:`, error);
        return false;
    }
}

async function main() {
    // Test text with various speech patterns
    const testText = `Hello! Let me demonstrate the voice capabilities.
    
    (happy)I'm really excited to show you this!) 
    
    (thoughtful)Now, let me think about something important...)
    
    (soft)This is how I speak softly and calmly.)
    
    *This part is emphasized*, and **this part is strongly emphasized**.
    
    (excited)Wow! This is amazing!) ... (calm)But let's stay focused.)`;

    console.log('Starting TTS API tests...\n');

    // Get available voices
    const voices = await openSourceTTS.getVoices();
    console.log('Available voices:', voices.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        language: v.language
    })));

    // Test each voice
    let success = true;
    for (const voice of voices) {
        if (!await testVoice(voice.id, testText)) {
            success = false;
        }
    }

    // Get voices by category
    console.log('\nTesting voice categories...');
    const categories = await openSourceTTS.getVoicesByCategory();
    console.log('Voice categories:', Object.keys(categories));

    if (success) {
        console.log('\n✓ All TTS API tests completed successfully');
    } else {
        console.log('\n✗ Some TTS API tests failed');
        process.exit(1);
    }
}

// Run tests
main().catch(console.error);
