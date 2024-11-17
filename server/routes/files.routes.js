const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');
const File = require('../models/file.model');

// Search files
router.get('/search', requireAuth, async (req, res) => {
  try {
    const { query, favorite, sortBy = 'createdAt', sortOrder = 'desc', tags } = req.query;
    
    // Build query
    const searchQuery = {
      userId: req.user.userId
    };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (favorite === 'true') {
      searchQuery.favorite = true;
    }

    if (tags) {
      searchQuery.tags = { $all: Array.isArray(tags) ? tags : [tags] };
    }

    // Get files from database
    const files = await File.find(searchQuery)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .lean();

    // Map files to include URLs
    const filesWithUrls = files.map(file => ({
      ...file,
      url: `/api/files/audio/${file._id}`,
      id: file._id.toString()
    }));

    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error searching files:', error);
    res.status(500).json({ error: 'Failed to search files' });
  }
});

// Get file metadata
router.get('/:fileId', requireAuth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      userId: req.user.userId
    }).lean();

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      ...file,
      url: `/api/files/audio/${file._id}`,
      id: file._id.toString()
    });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ error: 'Failed to get file metadata' });
  }
});

// Serve audio file
router.get('/audio/:fileId', requireAuth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      userId: req.user.userId
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '../', file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving audio file:', error);
    res.status(500).json({ error: 'Failed to serve audio file' });
  }
});

// Update file metadata
router.patch('/metadata/:fileId', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['title', 'category', 'tags', 'favorite'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const file = await File.findOneAndUpdate(
      { _id: req.params.fileId, userId: req.user.userId },
      { $set: filteredUpdates },
      { new: true }
    ).lean();

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      ...file,
      url: `/api/files/audio/${file._id}`,
      id: file._id.toString()
    });
  } catch (error) {
    console.error('Error updating file metadata:', error);
    res.status(500).json({ error: 'Failed to update file metadata' });
  }
});

// Delete file
router.delete('/:fileId', requireAuth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      userId: req.user.userId
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete metadata from database
    await File.deleteOne({ _id: file._id });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Add tag to file
router.post('/:fileId/tags', requireAuth, async (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag) {
      return res.status(400).json({ error: 'Tag is required' });
    }

    const file = await File.findOneAndUpdate(
      { _id: req.params.fileId, userId: req.user.userId },
      { $addToSet: { tags: tag } },
      { new: true }
    ).lean();

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      ...file,
      url: `/api/files/audio/${file._id}`,
      id: file._id.toString()
    });
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// Remove tag from file
router.delete('/:fileId/tags/:tag', requireAuth, async (req, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.fileId, userId: req.user.userId },
      { $pull: { tags: req.params.tag } },
      { new: true }
    ).lean();

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      ...file,
      url: `/api/files/audio/${file._id}`,
      id: file._id.toString()
    });
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

// Toggle favorite status
router.post('/:fileId/favorite', requireAuth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      userId: req.user.userId
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    file.favorite = !file.favorite;
    await file.save();

    res.json({
      ...file.toObject(),
      url: `/api/files/audio/${file._id}`,
      id: file._id.toString()
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite status' });
  }
});

module.exports = router;
