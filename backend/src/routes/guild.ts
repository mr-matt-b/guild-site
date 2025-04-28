import express from "express";
import {
  getTopCharactersByAchievementPoints,
  getTopCharactersByEquippedItemLevel,
} from "../services/characterService";

const router = express.Router();

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
