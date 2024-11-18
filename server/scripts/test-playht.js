require('dotenv').config();
const playHT = require('../services/playht.service');
const fs = require('fs');

async function testPlayHT() {
    try {
        console.log('Starting PlayHT test...');
        console.log('Using credentials:', {
            userId: process.env.PLAYHT_USER_ID,
            apiKey: process.env.PLAYHT_SECRET_KEY?.substring(0, 5) + '...'
        });

        // Test getting voices
        console.log('\nFetching voices...');
        const voices = await playHT.getVoices();
        console.log(`Successfully fetched ${voices.length} voices`);
        
        // Find a specific voice (e.g., Adolfo)
        const testVoice = voices.find(v => v.name === 'Adolfo') || voices[0];
        console.log('\nUsing voice:', JSON.stringify(testVoice, null, 2));

        // Test speech synthesis with longer text
        console.log('\nTesting speech synthesis...');
        const testText = `
            Welcome to our comprehensive guide on artificial intelligence and machine learning.
            In today's rapidly evolving technological landscape, AI and ML are transforming how we live and work.
            From autonomous vehicles to smart home devices, these technologies are becoming increasingly integrated into our daily lives.
            Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions with remarkable accuracy.
            This has led to breakthroughs in various fields, including healthcare, finance, and environmental protection.
            As we continue to advance, the possibilities seem endless. The future of AI holds tremendous potential for solving complex global challenges.
            However, it's crucial to consider the ethical implications and ensure responsible development of these powerful technologies.
            Let's explore how these innovations are shaping our world and what we can expect in the years to come.
        `;
        
        console.log('Text length:', testText.length, 'characters');
        console.log('Generating speech...');
        
        const audioContent = await playHT.synthesizeSpeech(testText, testVoice.id);
        
        // Save the audio file
        if (!fs.existsSync('./test_output')) {
            fs.mkdirSync('./test_output', { recursive: true });
        }
        const outputPath = './test_output/playht_test.mp3';
        fs.writeFileSync(outputPath, audioContent);
        
        console.log(`\nTest completed successfully!`);
        console.log(`Audio file saved to: ${outputPath}`);

    } catch (error) {
        console.error('Test failed:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

testPlayHT();
