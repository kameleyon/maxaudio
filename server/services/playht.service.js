const axios = require('axios');

const PLAYHT_USER_ID = process.env.PLAYHT_USER_ID;
const PLAYHT_SECRET_KEY = process.env.PLAYHT_SECRET_KEY;
const PLAYHT_API_URL = 'https://api.play.ht/api/v2';

const getVoices = async () => {
  try {
    const response = await axios.get(`${PLAYHT_API_URL}/voices`, {
      headers: {
        accept: 'application/json',
        AUTHORIZATION: PLAYHT_SECRET_KEY,
        'X-USER-ID': PLAYHT_USER_ID
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching voices from Play.ht:', error);
    throw error;
  }
};

const synthesizeSpeech = async (text, voiceId) => {
  try {
    const response = await axios.post(`${PLAYHT_API_URL}/synthesize`, {
      text,
      voice: voiceId
    }, {
      headers: {
        AUTHORIZATION: PLAYHT_SECRET_KEY,
        'X-USER-ID': PLAYHT_USER_ID,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error synthesizing speech with Play.ht:', error);
    throw error;
  }
};

module.exports = {
  getVoices,
  synthesizeSpeech
};
