const openSourceTTS = require('../services/opensource-tts.service');
const path = require('path');
const fs = require('fs').promises;

async function testTTS() {
    const testDir = path.join(__dirname, '../test-output');
    
    try {
        // Create test output directory
        await fs.mkdir(testDir, { recursive: true });
        console.log('Created test output directory');

        // Test text with various natural speech markers
        const testText = `
            Hello! (happy)Welcome to our text-to-speech test.) 
            Let me demonstrate some natural speech features...
            
            (excited)First, let's try some emotional speech!)
            
            (thoughtful)Now, let's think about this carefully.)
            
            Here's a question for you? And here's an exclamation!
            
            (soft)Finally, let's end with a gentle conclusion.)
        `;

        console.log('\nTesting Coqui YourTTS...');
        try {
            const coquiOutput = await openSourceTTS.generateSpeech(testText, {
                engine: 'coqui',
                language: 'en',
                outputPath: path.join(testDir, 'coqui_test.wav')
            });
            console.log('✓ Coqui TTS test successful');
            console.log('Output saved to:', path.join(testDir, 'coqui_test.wav'));
        } catch (error) {
            console.error('✗ Coqui TTS test failed:', error.message);
        }

        console.log('\nTesting Piper TTS...');
        try {
            const piperOutput = await openSourceTTS.generateSpeech(testText, {
                engine: 'piper',
                language: 'en',
                outputPath: path.join(testDir, 'piper_test.wav')
            });
            console.log('✓ Piper TTS test successful');
            console.log('Output saved to:', path.join(testDir, 'piper_test.wav'));
        } catch (error) {
            console.error('✗ Piper TTS test failed:', error.message);
        }

        // Test voice list
        console.log('\nGetting available voices...');
        const voices = await openSourceTTS.getVoices();
        console.log('Available voices:', voices);

        // Test SSML generation
        console.log('\nTesting SSML generation...');
        const ssml = await openSourceTTS.convertToSSML(testText);
        console.log('Generated SSML:', ssml);

        console.log('\nTest Results Summary:');
        console.log('=====================');
        console.log('Test files have been generated in:', testDir);
        console.log('Please check the audio files for:');
        console.log('1. Natural speech patterns');
        console.log('2. Emotional variations');
        console.log('3. Proper pauses and emphasis');
        console.log('4. Overall audio quality');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run tests
console.log('Starting TTS tests...\n');
testTTS().then(() => {
    console.log('\nTests completed.');
}).catch(error => {
    console.error('\nTest suite failed:', error);
    process.exit(1);
});
