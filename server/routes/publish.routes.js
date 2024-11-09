import { Router } from "express";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const publishRoutes = Router();

// Store for user audio files (in production this would be a database)
const userAudios = new Map();

publishRoutes.post("/", async (req, res) => {
  console.log("Publish request received");
  
  const {
    userId,
    audioBlob,
    fileName,
    transcript,
    settings
  } = req.body;

  if (!userId || !audioBlob || !fileName) {
    console.error("Missing required fields:", { userId, fileName, hasAudio: !!audioBlob });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("Creating user directory...");
    // Create user directory if it doesn't exist
    const userDir = path.join(__dirname, '..', 'audios', userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    console.log("Converting base64 to buffer...");
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBlob, 'base64');
    
    // Save audio file
    const filePath = path.join(userDir, `${fileName}.mp3`);
    console.log("Saving file to:", filePath);
    
    fs.writeFileSync(filePath, audioBuffer);
    console.log("File saved successfully");

    // Save metadata
    const metadata = {
      id: Date.now().toString(),
      fileName,
      transcript,
      settings,
      createdAt: new Date().toISOString(),
      filePath: `/audios/${userId}/${fileName}.mp3`
    };

    // Store metadata (in production this would go to a database)
    if (!userAudios.has(userId)) {
      userAudios.set(userId, []);
    }
    userAudios.get(userId).push(metadata);
    console.log("Metadata stored:", metadata);

    res.json({
      success: true,
      message: 'Audio published successfully',
      metadata
    });
  } catch (error) {
    console.error("Error publishing audio:", error);
    res.status(500).json({ 
      error: "Failed to publish audio",
      details: error.message 
    });
  }
});

publishRoutes.get("/files/:userId", (req, res) => {
  const { userId } = req.params;
  const userFiles = userAudios.get(userId) || [];
  res.json(userFiles);
});
