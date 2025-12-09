const { OpenAI } = require("openai");
const { Song } = require("../models");
const { Op } = require("sequelize");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class SearchController {
  static async searchByVoice(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file required" });
      }

      // STEP 1: Convert audio → text
      const transcription = await openai.audio.transcriptions.create({
        file: {
          buffer: req.file.buffer,
          filename: req.file.originalname,
        },
        model: "gpt-4o-mini-tts", // atau "whisper-1" bila tersedia
        response_format: "text",
      });

      const text = transcription.text;
      console.log("AI text:", text);

      // STEP 2: Cari lagu berdasarkan text
      const songs = await Song.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${text}%` } },
            { artist: { [Op.iLike]: `%${text}%` } },
          ],
        },
      });

      res.json({
        query: text,
        results: songs,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SearchController;
