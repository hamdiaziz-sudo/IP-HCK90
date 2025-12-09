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
  // AI-powered mood-based recommendation (with fallback for quota exceeded)
  static async recommendByMood(req, res, next) {
    try {
      const { mood } = req.body;

      if (!mood || mood.trim() === "") {
        return res.status(400).json({ message: "Mood is required" });
      }

      console.log("🎵 Analyzing mood:", mood);

      // Mood keywords mapping (fallback AI logic)
      const moodKeywords = {
        happy: ["upbeat", "cheerful", "positive", "joy", "fun"],
        sad: ["melancholic", "emotional", "slow", "acoustic", "heartbreak"],
        energetic: ["dance", "pop", "upbeat", "party", "energy"],
        romantic: ["love", "slow", "ballad", "acoustic", "fix", "coldplay"],
        chill: ["relaxing", "ambient", "slow", "peaceful", "calm", "acoustic"],
        party: ["dance", "upbeat", "electronic", "pop", "fun"],
        workout: ["energetic", "fast", "electronic", "pop", "pump"],
        focus: ["ambient", "instrumental", "calm", "minimal", "peaceful"],
        emotional: ["emotional", "slow", "ballad", "acoustic", "heartfelt"],
        rock: ["rock", "electric", "guitar", "cold", "play"],
        indie: ["indie", "acoustic", "alternative", "fix", "you"],
        alternative: ["alternative", "indie", "emotional", "coldplay"],
      };

      // Try Gemini first (if quota available)
      let analysis = null;
      let aiUsed = false;

      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });

        const analysisResult = await model.generateContent(`
Analyze this mood description and extract search keywords for music:
"${mood}"

Response format: Return ONLY keywords separated by commas. Max 5 keywords.
        `);

        analysis = analysisResult.response.text().trim();
        aiUsed = true;
        console.log("🤖 AI Analysis (Gemini):", analysis);
      } catch (err) {
        // Fallback: Use local mood analysis without API
        console.log("⚠️ Gemini quota exceeded, using fallback mood analysis");

        // Match mood keywords
        const lowerMood = mood.toLowerCase();
        let matchedKeywords = [];

        for (const [moodType, keywords] of Object.entries(moodKeywords)) {
          if (lowerMood.includes(moodType)) {
            matchedKeywords = [...matchedKeywords, ...keywords];
          }
        }

        // If no mood match, extract all words > 3 chars from input
        if (matchedKeywords.length === 0) {
          const words = lowerMood
            .split(" ")
            .filter((w) => w.length > 3)
            .slice(0, 8);
          matchedKeywords = [...matchedKeywords, ...words];
        }

        // Remove duplicates
        matchedKeywords = [...new Set(matchedKeywords)];

        analysis = matchedKeywords.slice(0, 8).join(", ");
        aiUsed = false;
        console.log("🔍 Fallback Analysis:", analysis);
      }

      // Extract keywords
      const keywords = analysis.split(",").map((k) => k.trim());

      // Search songs based on keywords
      let songs = [];

      for (const keyword of keywords) {
        if (keyword.length > 0) {
          const results = await Song.findAll({
            where: {
              [Op.or]: [
                { title: { [Op.iLike]: `%${keyword}%` } },
                { artist: { [Op.iLike]: `%${keyword}%` } },
              ],
            },
            limit: 5,
          });
          songs = [...songs, ...results];
        }
      }

      // Remove duplicates
      let uniqueSongs = Array.from(
        new Map(songs.map((item) => [item.id, item])).values()
      ).slice(0, 20);

      // If no results, try with smarter matching
      if (uniqueSongs.length === 0) {
        console.log(
          "⚠️ No exact match found, trying smart recommendations based on mood"
        );

        const lowerMood = mood.toLowerCase();

        // Mood-based smart recommendations
        if (
          lowerMood.includes("happy") ||
          lowerMood.includes("upbeat") ||
          lowerMood.includes("party")
        ) {
          // Happy/Party songs
          uniqueSongs = await Song.findAll({
            where: {
              [Op.or]: [
                { title: { [Op.iLike]: "%Levitating%" } },
                { title: { [Op.iLike]: "%Uptown%" } },
                { title: { [Op.iLike]: "%Blinding%" } },
                { artist: { [Op.iLike]: "%Dua%" } },
              ],
            },
          });
        } else if (
          lowerMood.includes("romantic") ||
          lowerMood.includes("love")
        ) {
          // Romantic songs
          uniqueSongs = await Song.findAll({
            where: {
              [Op.or]: [
                { title: { [Op.iLike]: "%Perfect%" } },
                { title: { [Op.iLike]: "%Someone%" } },
                { title: { [Op.iLike]: "%Shape%" } },
                { artist: { [Op.iLike]: "%Sheeran%" } },
              ],
            },
          });
        } else if (
          lowerMood.includes("sad") ||
          lowerMood.includes("emotional") ||
          lowerMood.includes("melancholic")
        ) {
          // Sad/Emotional songs
          uniqueSongs = await Song.findAll({
            where: {
              [Op.or]: [
                { title: { [Op.iLike]: "%Fix%" } },
                { title: { [Op.iLike]: "%Numb%" } },
                { title: { [Op.iLike]: "%Rolling%" } },
                { artist: { [Op.iLike]: "%Coldplay%" } },
              ],
            },
          });
        } else {
          // Default: return all
          uniqueSongs = await Song.findAll({
            limit: 20,
            order: [["id", "ASC"]],
          });
        }
      }

      console.log(`✅ Found ${uniqueSongs.length} song(s) matching mood`);

      res.status(200).json({
        success: true,
        mood: mood,
        aiAnalysis: analysis,
        aiUsed: aiUsed,
        analysisMode: aiUsed ? "Gemini AI" : "Local AI Fallback",
        results: uniqueSongs,
        count: uniqueSongs.length,
      });
    } catch (err) {
      console.error("❌ Error:", err);
      next(err);
    }
  }

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
