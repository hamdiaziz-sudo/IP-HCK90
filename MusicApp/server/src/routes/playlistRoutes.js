const express = require('express');
const { Playlist, PlaylistSong, Song } = require('../models');
const authenticateToken = require('../middleware/authenticateToken');
const { Op } = require('sequelize');

const router = express.Router();

// Create playlist
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      userId: req.userId,
      name,
      description: description || null,
      isPublic: isPublic || false
    });

    res.status(201).json({
      message: 'Playlist created successfully',
      data: playlist
    });
  } catch (error) {
    next(error);
  }
});

// Get all playlists for user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const playlists = await Playlist.findAll({
      where: { userId: req.userId },
      include: {
        model: Song,
        as: 'Songs',
        through: { attributes: [] }
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Playlists retrieved successfully',
      total: playlists.length,
      data: playlists
    });
  } catch (error) {
    next(error);
  }
});

// Get playlist by id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id, {
      include: {
        model: Song,
        as: 'Songs',
        through: { attributes: ['addedAt'] }
      }
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check authorization (owner or public)
    if (playlist.userId !== req.userId && !playlist.isPublic) {
      return res.status(403).json({ error: 'You do not have access to this playlist' });
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
});

// Update playlist
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;

    const playlist = await Playlist.findByPk(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check authorization
    if (playlist.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only update your own playlists' });
    }

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.json({
      message: 'Playlist updated successfully',
      data: playlist
    });
  } catch (error) {
    next(error);
  }
});

// Delete playlist
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check authorization
    if (playlist.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own playlists' });
    }

    await playlist.destroy();

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Add song to playlist
router.post('/:playlistId/songs', authenticateToken, async (req, res, next) => {
  try {
    const { songId } = req.body;
    const { playlistId } = req.params;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }

    const playlist = await Playlist.findByPk(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check authorization
    if (playlist.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only add songs to your own playlists' });
    }

    const song = await Song.findByPk(songId);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if song already in playlist
    const existing = await PlaylistSong.findOne({
      where: { playlistId, songId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Song already in playlist' });
    }

    await playlist.addSong(song);

    res.status(201).json({
      message: 'Song added to playlist successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Remove song from playlist
router.delete('/:playlistId/songs/:songId', authenticateToken, async (req, res, next) => {
  try {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findByPk(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check authorization
    if (playlist.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only modify your own playlists' });
    }

    const song = await Song.findByPk(songId);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    await playlist.removeSong(song);

    res.json({ message: 'Song removed from playlist successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
