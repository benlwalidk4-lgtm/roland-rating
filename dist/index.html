import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Set up CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Set up Multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB file size limit
  },
});

// Lazy-initialize Google GenAI client to prevent crash on startup if API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. Text Chat Endpoint (Supports multi-turn chat history)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, temperature } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
    }

    const ai = getAiClient();

    // Map frontend messages into Gemini SDK-friendly contents
    // Format: { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedContents = messages.map((msg: { role: string; content: string }) => {
      // Gemini expects role to be either 'user' or 'model'
      const role = msg.role === "assistant" ? "model" : "user";
      return {
        role: role,
        parts: [{ text: msg.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || "You are a helpful and highly intelligent AI assistant who responds beautifully. You support both Arabic and English seamlessly.",
        temperature: temperature !== undefined ? Number(temperature) : 0.7,
      },
    });

    res.json({
      role: "assistant",
      content: response.text || "No response text generated.",
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "An error occurred during generating content." });
  }
});

// 2. File Analysis Endpoint (Uses Multer to handle file uploads)
app.post("/api/analyze-file", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const prompt = req.body.prompt || "Analyze this file in detail and explain what it is.";
    const systemInstruction = req.body.systemInstruction;

    if (!file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }

    const ai = getAiClient();

    // Convert file buffer to base64
    const base64Data = file.buffer.toString("base64");
    const mimeType = file.mimetype;

    const filePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [filePart, textPart],
      },
      config: {
        systemInstruction: systemInstruction || "You are an expert multi-modal content analyst. Analyze the provided file content thoroughly and address the user's prompt.",
      },
    });

    res.json({
      fileName: file.originalname,
      mimeType: mimeType,
      size: file.size,
      content: response.text || "No response generated.",
    });
  } catch (error: any) {
    console.error("Error in /api/analyze-file:", error);
    res.status(500).json({ error: error.message || "An error occurred during file analysis." });
  }
});

// 3. Roland Facial Rating Endpoint
app.post("/api/rate", upload.fields([{ name: "front" }, { name: "side" }]), async (req: any, res: any) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const frontImage = files?.["front"]?.[0];
    const sideImage = files?.["side"]?.[0];

    if (!frontImage || !sideImage) {
      return res.status(400).json({ error: "Both 'front' and 'side' profile images must be uploaded." });
    }

    const ai = getAiClient();

    // The strict system instructions for the Roland facial rating model
    const systemInstruction = `You are a strict, objective facial aesthetic rater using the 'Roland Rating' system. 
Analyze the provided front and side profile images of the face. 
Calculate scores (0.0 to 10.0) based on strict scientific aesthetic metrics:
- OVERALL HARMONY: Weighted average of front and side harmony.
- FRONT HARMONY: Facial thirds, bigonial width, canthal tilt, and facial ratios.
- SIDE HARMONY: Gonial angle, maxilla projection, chin projection, and orbital vector.
- MISC FEAT: Skin quality, eye area flaws, teeth, smile dynamics, and hair density.
- SEX APPEAL: Dimorphic traits highly appealing to the opposite sex (lip thickness, eyelash length, eyebrow density).
- DIMORPHISM: Bone structure masculinity (brow ridge bossing, deep-set eyes, chin width). If female, rate bone structure femininity (softness, jawline angle, cheek volume) but keep the key name "DIMORPHISM".
- ANGULARITY: Bone definition, leanness, hollow cheeks, and jawline visibility.
- TOTAL: The final objective SMV score.
- ACCEPTED RANGE: The estimated fluctuation range (e.g., '7.8 - 8.1').

Return ONLY a valid JSON object with the exact following keys: "OVERALL HARMONY", "FRONT HARMONY", "SIDE HARMONY", "MISC FEAT", "SEX APPEAL", "DIMORPHISM", "ANGULARITY", "TOTAL", "ACCEPTED RANGE". Do not include markdown formatting.`;

    const frontPart = {
      inlineData: {
        data: frontImage.buffer.toString("base64"),
        mimeType: frontImage.mimetype,
      },
    };

    const sidePart = {
      inlineData: {
        data: sideImage.buffer.toString("base64"),
        mimeType: sideImage.mimetype,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        systemInstruction,
        "Evaluate these two images (Front and Side profile) based on the Roland Rating system.",
        frontPart,
        sidePart,
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    // Sanitize response text if it has markdown formatting
    const sanitizedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(sanitizedText);

    // Calculate TIER and COLOR based on TOTAL score
    const total = parseFloat(resultJson["TOTAL"]) || 0.0;
    let tier = "";
    let color = "";

    if (total < 5.0) {
      tier = "Sub5";
      color = "#808080"; // Gray
    } else if (total < 5.5) {
      tier = "Normie";
      color = "#A4C639"; // Yellowish green
    } else if (total < 6.5) {
      tier = "HTN";
      color = "#32CD32"; // Green
    } else if (total < 7.0) {
      tier = "Chadlite";
      color = "#00BFFF"; // Light blue
    } else if (total < 8.0) {
      tier = "Chad";
      color = "#0000FF"; // Blue
    } else if (total < 9.0) {
      tier = "Gigachad";
      color = "#8A2BE2"; // Purple
    } else if (total <= 9.5) {
      tier = "Adamlite";
      color = "#FF4500"; // Red-orange
    } else {
      tier = "True Adam";
      color = "#FFD700"; // Bright Gold
    }

    resultJson["TIER"] = tier;
    resultJson["COLOR"] = color;

    res.json(resultJson);
  } catch (error: any) {
    console.error("Error in /api/rate:", error);
    res.status(500).json({ error: error.message || "Failed to process images and calculate scores." });
  }
});

// Set up Vite dev server or serve static assets
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Development mode: Vite middleware loaded.");
  } else {
    // Production: serve static assets from the dist folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production mode: Static assets served.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
