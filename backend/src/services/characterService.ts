import { Character } from "../models/Character";

export const updateCharacterAchievementPoints = async (
  name: string,
  realm: string,
  achievementPoints: number
) => {
  try {
    const character = await Character.findOneAndUpdate(
      { name, realm },
      {
        achievementPoints,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
    return character;
  } catch (error) {
    console.error("Error updating character achievement points:", error);
    throw error;
  }
};

export const updateCharacterEquippedItemLevel = async (
  name: string,
  realm: string,
  equippedItemLevel: number
) => {
  try {
    const character = await Character.findOneAndUpdate(
      { name, realm },
      {
        equippedItemLevel,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
    return character;
  } catch (error) {
    console.error("Error updating character equipped item level:", error);
    throw error;
  }
};

export const getTopCharactersByAchievementPoints = async (
  limit: number = 10
) => {
  try {
    const characters = await Character.find({ removed: false })
      .sort({ achievementPoints: -1 })
      .limit(limit);
    return characters;
  } catch (error) {
    console.error("Error fetching top characters:", error);
    throw error;
  }
};

export const getTopCharactersByEquippedItemLevel = async (
  limit: number = 10
) => {
  try {
    const characters = await Character.find({ removed: false })
      .sort({ equippedItemLevel: -1 })
      .limit(limit);
    return characters;
  } catch (error) {
    console.error("Error fetching top characters by item level:", error);
    throw error;
  }
};
