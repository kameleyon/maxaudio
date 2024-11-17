const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const path = require('path');

async function testGoogleAuth() {
  try {
    console.log('Testing Google Cloud Authentication...');
    
    const keyFilename = path.join(__dirname, '..', 'google-credentials.json');
    console.log('Loading credentials from:', keyFilename);
    
    const client = new TextToSpeechClient({ keyFilename });
    
    // Test by listing voices
    console.log('Attempting to list voices...');
    const [result] = await client.listVoices({});
    
    console.log('Successfully authenticated!');
    console.log(`Found ${result.voices.length} voices`);
    console.log('Sample voice:', result.voices[0]);
    
    return true;
  } catch (error) {
    console.error('Authentication failed:', error);
    if (error.code === 16) {
      console.error('This usually means the credentials are invalid or expired');
    }
    return false;
  }
}

testGoogleAuth();
