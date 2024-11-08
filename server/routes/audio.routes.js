import { Router } from "express";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const audioRoutes = Router();

// Mock audio generation for testing
audioRoutes.post("/generate", async (req, res) => {
  try {
    // Return a simple audio file for testing
    const testAudioPath = join(process.cwd(), 'server', 'audios', 'audio_1730998336964.mp3');
    res.sendFile(testAudioPath);
  } catch (error) {
    console.error("Error sending test audio:", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});

// Helper function to sanitize filename
const sanitizeFilename = (text) => {
  return text
    .slice(0, 20)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

audioRoutes.post("/save", async (req, res) => {
  console.log('Received save request');
  try {
    const {
      title,
      audioData,
      transcript
    } = req.body;

    if (!audioData || !transcript) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate filename from transcript + date + random ID
    const date = new Date().toISOString().split('T')[0];
    const fileId = uuidv4().slice(0, 8);
    const baseFilename = sanitizeFilename(transcript);
    const fileName = `${baseFilename}_${date}_${fileId}.mp3`;
    const filePath = join(process.cwd(), 'server', 'audios', fileName);

    console.log('Saving audio to:', filePath);

    // Convert base64 to buffer and save
    const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
    await writeFile(filePath, audioBuffer);

    console.log('Audio saved successfully');

    res.json({
      message: "Audio file saved successfully",
      fileName
    });
  } catch (error) {
    console.error("Error saving audio:", error);
    res.status(500).json({ error: "Failed to save audio file" });
  }
});