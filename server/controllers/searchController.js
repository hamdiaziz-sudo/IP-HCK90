const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Song } = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SUPPORTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/x-m4a",
];

class SearchController {
  static async searchByText(req, res, next) {
    try {
      const { query } = req.body;

      if (!query || query.trim() === "") {
        return res.status(400).json({ message: "Search query is required" });
      }

      const text = query.trim();
      console.log("🔍 Text search query:", text);

      const songs = await Song.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${text}%` } },
            { artist: { [Op.iLike]: `%${text}%` } },
          ],
        },
        limit: 20,
      });

      console.log(`✅ Found ${songs.length} song(s)`);

      res.status(200).json({
        success: true,
        query: text,
        results: songs,
        count: songs.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async searchByVoice(req, res, next) {
    let tempFilePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      if (!SUPPORTED_AUDIO_TYPES.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: `Unsupported audio format. Supported formats: ${SUPPORTED_AUDIO_TYPES.join(
            ", "
          )}`,
        });
      }

      const fileSizeInMB = req.file.buffer.length / (1024 * 1024);
      if (fileSizeInMB > 25) {
        return res.status(400).json({
          message: "Audio file must be smaller than 25MB",
        });
      }

      console.log("📁 File received:", {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: `${fileSizeInMB.toFixed(2)} MB`,
      });

      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      tempFilePath = path.join(
        tempDir,
        `${Date.now()}-${req.file.originalname}`
      );
      fs.writeFileSync(tempFilePath, req.file.buffer);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      console.log("🤖 Using model: gemini-2.0-flash");

      const audioData = fs.readFileSync(tempFilePath).toString("base64");

      console.log("🎵 Processing audio file...");

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: audioData,
          },
        },
        {
          text: 'Please transcribe the audio content. Respond with ONLY the transcribed text, nothing else. If there is no speech, respond with "[no speech detected]".',
        },
      ]);

      if (!result.response.text()) {
        throw new Error(
          "Failed to transcribe audio - empty response from Gemini"
        );
      }

      let text = result.response.text().trim();
      console.log("✅ Transcription:", text);

      if (text.toLowerCase().includes("no speech detected")) {
        return res.status(400).json({
          success: false,
          message: "No speech detected in the audio file",
        });
      }

      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      const songs = await Song.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${text}%` } },
            { artist: { [Op.iLike]: `%${text}%` } },
          ],
        },
        limit: 20,
      });

      console.log(`🔍 Found ${songs.length} song(s)`);

      res.status(200).json({
        success: true,
        query: text,
        results: songs,
        count: songs.length,
      });
    } catch (err) {
      console.error("❌ Error:", err);

      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      if (
        err.status === 429 ||
        err.message.includes("Too Many Requests") ||
        err.message.includes("quota")
      ) {
        return res.status(429).json({
          success: false,
          message:
            "API quota exceeded. Please use /search/text endpoint for text-based search, or upgrade to paid API plan.",
          alternative: "/search/text (POST with { query: 'song name' })",
        });
      }

      if (
        err.message.includes("API key") ||
        err.message.includes("authentication")
      ) {
        return res.status(500).json({
          success: false,
          message: "API configuration error - please contact administrator",
        });
      }

      if (err.message.includes("Failed to transcribe")) {
        return res.status(400).json({
          success: false,
          message: "Failed to process audio - please try with a different file",
        });
      }

      res.status(500).json({
        success: false,
        message: "An error occurred while processing your request",
      });
    }
  }
}

module.exports = SearchController;
