require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const PLAYHT_USER_ID = '3I0uk4sKefXqOKsu6Yb9DDIfGrg1';
const PLAYHT_SECRET_KEY = 'f64bd73af7fa48d4a831e752a6affc74';
const url = 'https://api.play.ht/api/v2/voices';

async function testPlayHT() {
  try {
    const response = await axios.get(url, {
      headers: {
        accept: 'application/json',
        AUTHORIZATION: PLAYHT_SECRET_KEY,
        'X-USER-ID': PLAYHT_USER_ID
      }
    });
    console.log('Available voices:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testPlayHT();
