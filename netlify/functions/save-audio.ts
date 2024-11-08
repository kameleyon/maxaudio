import { Handler } from '@netlify/functions';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Helper function to sanitize filename
const sanitizeFilename = (text: string): string => {
  return text
    .slice(0, 20)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const { title, audioData, transcript } = JSON.parse(event.body || '{}');

    if (!audioData || !transcript) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Generate filename from transcript + date + random ID
    const date = new Date().toISOString().split('T')[0];
    const fileId = uuidv4().slice(0, 8);
    const baseFilename = sanitizeFilename(transcript);
    const fileName = `${baseFilename}_${date}_${fileId}.mp3`;
    
    // In Netlify Functions, we need to save to /tmp
    const filePath = join('/tmp', fileName);

    // Convert base64 to buffer and save
    const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
    await writeFile(filePath, audioBuffer);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Audio file saved successfully',
        fileName
      })
    };
  } catch (error: unknown) {
    console.error('Error saving audio:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save audio file',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
