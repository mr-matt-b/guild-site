import express from "express";
import {
  getTopCharactersByAchievementPoints,
  getTopCharactersByEquippedItemLevel,
} from "../services/characterService";

const router = express.Router();

// Add CORS headers to all guild routes
router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "https://guild-site.onrender.com"
      : "http://localhost:3000"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Endpoint to get top characters by achievement points

router.get("/top-characters/achievement-points", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 12;
    const characters = await getTopCharactersByAchievementPoints(limit);
    res.json(characters);
  } catch (error) {
    console.error("Error fetching top characters:", error);
    res.status(500).json({ error: "Failed to fetch top characters" });
  }
});

// Endpoint to get top characters by equipped item level
router.get("/top-characters/equipped-item-level", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const characters = await getTopCharactersByEquippedItemLevel(limit);
    res.json(characters);
  } catch (error) {
    console.error(
      "Error fetching top characters by equipped item level:",
      error
    );
    res
      .status(500)
      .json({ error: "Failed to fetch top characters by equipped item level" });
  }
});

export default router;
