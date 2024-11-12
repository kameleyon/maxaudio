const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/tts';

async function testTTSAPI() {
  try {
    console.log('Testing TTS API endpoints...\n');

    // Test basic TTS
    console.log('1. Testing basic TTS endpoint...');
    const testResponse = await axios.get(`${API_URL}/test`);
    console.log('✅ Basic TTS test successful');
    console.log('Generated file:', testResponse.data.file);
    console.log('File size:', testResponse.data.size, 'bytes');
    console.log('Characters:', testResponse.data.characters);

    // Get available voices
    console.log('\n2. Getting available voices...');
    const voicesResponse = await axios.get(`${API_URL}/voices`);
    console.log('✅ Got', voicesResponse.data.length, 'voices');
    console.log('Sample voices:');
    voicesResponse.data.slice(0, 3).forEach(voice => {
      console.log(`- ${voice.name} (${voice.languageCodes.join(', ')})`);
    });

    // Get languages
    console.log('\n3. Getting supported languages...');
    const languagesResponse = await axios.get(`${API_URL}/languages`);
    console.log('✅ Got', languagesResponse.data.length, 'languages');
    console.log('Sample languages:', languagesResponse.data.slice(0, 5).join(', '));

    // Generate audio with specific voice
    console.log('\n4. Testing audio generation with specific voice...');
    const generateResponse = await axios.post(`${API_URL}/generate`, {
      text: 'This is a test with a specific voice and settings.',
      voice: 'en-US-Neural2-F',
      language: 'en-US',
      pitch: 0,
      speakingRate: 1.0
    });
    console.log('✅ Generated audio file:', generateResponse.data.file);
    console.log('File size:', generateResponse.data.size, 'bytes');

    // Get voice details
    console.log('\n5. Getting voice details...');
    const voiceDetailsResponse = await axios.get(`${API_URL}/voices/en-US-Neural2-F`);
    console.log('✅ Got voice details:', voiceDetailsResponse.data.name);

    console.log('\n✅ All TTS API tests passed!');
    console.log('\nNext steps:');
    console.log('1. Check the generated audio files in server/temp/');
    console.log('2. Try different voices and languages');
    console.log('3. Test with longer texts');
    console.log('4. Monitor usage and quotas');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('\nMake sure the server is running:');
      console.log('1. cd server');
      console.log('2. npm run dev');
    }
    process.exit(1);
  }
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

testTTSAPI().catch(console.error);
