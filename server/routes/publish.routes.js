import { Router } from "express";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from '../middleware/auth.js';
import { usageService } from '../services/usage.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const publishRoutes = Router();

// Store for user audio files (in production this would be a database)
const userAudios = new Map();

publishRoutes.post("/", auth, async (req, res) => {
  console.log("Publish request received");
  
  const {
    audioBlob,
    fileName,
    transcript,
    settings
  } = req.body;

  const userId = req.auth.userId;

  if (!userId || !audioBlob || !fileName) {
    console.error("Missing required fields:", { userId, fileName, hasAudio: !!audioBlob });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Track API request
    const requestTracking = await usageService.trackRequest(userId);
    if (!requestTracking.allowed) {
      return res.status(429).json({
        error: {
          message: 'Rate limit exceeded',
          details: requestTracking
        }
      });
    }

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

publishRoutes.get("/files/:userId", auth, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const authenticatedUserId = req.auth.userId;

    // Users can only access their own files
    if (requestedUserId !== authenticatedUserId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Track API request
    const requestTracking = await usageService.trackRequest(authenticatedUserId);
    if (!requestTracking.allowed) {
      return res.status(429).json({
        error: {
          message: 'Rate limit exceeded',
          details: requestTracking
        }
      });
    }

    const userFiles = userAudios.get(requestedUserId) || [];
    res.json(userFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ 
      error: "Failed to fetch files",
      details: error.message 
    });
  }
});
