import express from "express";
import {
  updateCharacterAchievementPoints,
  getTopCharactersByAchievementPoints,
} from "../services/characterService";

const router = express.Router();

// ... existing code ...

router.get("/profile/wow/character/:realm/:name", async (req, res) => {
  try {
    const { realm, name } = req.params;
    const response = await fetch(
      `${process.env.WOW_API_BASE_URL}/profile/wow/character/${realm}/${name}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WOW_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch character data");
    }

    const data = await response.json();

    // Update achievement points in our database
    if (data.achievement_points) {
      await updateCharacterAchievementPoints(
        name,
        realm,
        data.achievement_points
      );
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching character profile:", error);
    res.status(500).json({ error: "Failed to fetch character profile" });
  }
});

export default router;
