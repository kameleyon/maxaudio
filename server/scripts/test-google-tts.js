const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');

// Service account credentials
const credentials = {
  type: "service_account",
  project_id: "audiomax-440801",
  private_key_id: "b5547b989eecb72610b5b2cca072f3a3bda1275b",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIxGnbLnGFYaE2\n0tlUaJFn8PI1/0NjGQT5TS1ap/yfh7XsQ2Sq+f/QDIVrXMmuAbWIkwLT6rPmHH/K\n7iZFlnSwaP9ZAiL9qoBLm2yl5NscfN5UdqdDYhgr2YgsRYy0J4WzRVtkr62Ifvcq\n1vwnQ/X9nYmcxpQu9e0r1KmIlVvfmq4/yggBqHlUjerVLjhA5NPRTBMWanmEFk89\nidxAvFDCbdVFtK3zeGHdcdI6G28K35wshV2t1PM8xsmN473arflLUCA0mXGA+lZq\nnjwtqy4vdm/KdzFvWGQ2sTUpLH4oTc/D4EsYRO//vM4ZbjKtJ/XJBcQ6FlUmieHu\n/XY7sRKPAgMBAAECggEAATita74NJVfPMMo7E0iSF9Dc4wgsVtChAMi/5VS9aKrm\np/Nrh0CuxZ5AQMzrhoRBs2VpkG+q/Lw/k4V5h4ni0uMI77CdTfSnLn36pUU0h05S\nIbi/hJGJzMYMf/6sLRgbRikAyO3EraWSdttUfLdVPV/cdjO+VL8afZJnFJkVgB04\nNVk3LKMeiWQ7hBdL7H0DgN7kPuFoFTXg2iPEDDLAW7J29hQ+YPxycLQS+AS2ir6+\nhtOP7WEK0ONdZZx8p6kCROPi+kzZbG4/8y7PAoTYnQ2xSjLsStbUKLNrNTjMndTK\n35wbIqAsbTSXPfGg/l6IeIPJWWTDgQF9Iog7Np1d6QKBgQD2S1KRyQukqWfHHCmS\nidZfOR4/JMnGzkcveOiKWf6mkoQoxXbcupVWLvir0v2CUxvXVqxKvH73dfQMqCgN\nXJSctjNMVsjqRsagvfOSIOWwH/BtP3ayPqTsnKOQdUb9sIU88MBbtO5GuYmnNslX\nHTjkIGGe4NG7NB0u5W3+89Pj3QKBgQDQrc2qEAtY5QNcL0Hx1S3mIHNoOHrc1YKO\nsZzxX93Q2iFfrD88R0RkVbPKMWLo20agXqYy2L4KtUaa4eheeS2k/Qea1tCujCVv\nRGZ6318OEfFfqrUtRoZ/ukknZQ8CBmVP3IHu0rg5VSWSOKus4bwE7dgxt8uffkKc\nt6+XONevWwKBgCv8F6rhdKrbdiUg6mu5Igevc69jKoXOoPfhZ+YNXGTzFZcSbL/O\nsozJpq9I5u03WmmCmRJfx2z6K7N29HAucHvsLg0cEpWEPkTGp5EZPuvNSGq6QsBi\nX6HB95P83cjAlYrkk/XMwiDvUZ4DMsHT/iz/e2+cRthf3jZZ0uMNOHIhAoGAPDpd\niH7W95IpdRrCmqyfcbLd/C+I7mHFK7ABjvzPRW8fgMBzA8/B4n+Fw46bcH+RE8od\nh8FcoDSPqzYWXeX1kY/h+QOU+TvDtih0t3PuuF3fX3AimG2pdgXrBS66tSfpZ7JJ\n4gb5WrrDfD9U9TG1lWqcIkVcxKypRxgQ2sFyJs8CgYEAn8O/6XvHXjgp16VKyym7\nblO5n9upBSe8hzf8/T/N50tcR36TKjnABAdZwJspQYNmFD1DJWQHPAw4AOaD4fzJ\ngT5kOycHCkSkv8qJwmpzxRNs6HlU8onsG4hxhlEZ5DHWL0pTDwUykfOKmaMibG9P\nx39Ny3IUgDHAh/mf/GQN5nw=\n-----END PRIVATE KEY-----\n",
  client_email: "text2speech@audiomax-440801.iam.gserviceaccount.com",
  client_id: "827680900052-dm36j76jhcqh96k78gl89rc3p9ig4d2n.apps.googleusercontent.com",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/text2speech%40audiomax-440801.iam.gserviceaccount.com"
};

async function testTTS() {
  try {
    console.log('Testing Google Cloud Text-to-Speech...');

    // Initialize client with credentials
    const client = new TextToSpeechClient({ credentials });

    // Test text
    const text = 'Hello from MaxAudio! This is a test of the Google Cloud Text-to-Speech API.';

    // Create request
    const request = {
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    console.log('Generating speech...');
    const [response] = await client.synthesizeSpeech(request);

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save audio file
    const outputFile = path.join(outputDir, 'test.mp3');
    fs.writeFileSync(outputFile, response.audioContent, 'binary');

    console.log(`✅ Success! Audio saved to: ${outputFile}`);
    console.log('Character count:', text.length);
    console.log('Audio file size:', fs.statSync(outputFile).size, 'bytes');

    // Get available voices
    console.log('\nGetting available voices...');
    const [voices] = await client.listVoices({});
    console.log('Available voices:', voices.voices.length);
    console.log('Sample voices:');
    voices.voices.slice(0, 5).forEach(voice => {
      console.log(`- ${voice.name} (${voice.languageCodes.join(', ')})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 7) {
      console.error('\nPermission denied. Please:');
      console.log('1. Enable Cloud Text-to-Speech API');
      console.log('2. Check service account permissions');
    }
    process.exit(1);
  }
}

testTTS().catch(console.error);
