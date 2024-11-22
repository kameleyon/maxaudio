const axios = require('axios');

async function generateAudioWithPlayHT(text, voice) {
  try {
    const response = await axios.post(
      'https://api.play.ht/api/v2/tts',
      {
        text,
        voice,
        quality: 'premium'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PLAYHT_SECRET_KEY}`,
          'X-User-ID': process.env.PLAYHT_USER_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    // Get the audio URL from the response
    const audioUrl = response.data.url;

    // Download the audio file
    const audioResponse = await axios.get(audioUrl, {
      responseType: 'arraybuffer'
    });

    return audioResponse.data;
  } catch (error) {
    console.error('PlayHT API Error:', error);
    throw error;
  }
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text, voice = "larry" } = JSON.parse(event.body);

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    console.log('Processing text of length:', text.length);
    console.time('audioProcessing');

    const audioBuffer = await generateAudioWithPlayHT(text, voice);

    console.timeEnd('audioProcessing');
    console.log('Audio generated successfully');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString()
      },
      body: Buffer.from(audioBuffer).toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error in generateAudio function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate audio',
        details: error.message
      })
    };
  }
};
