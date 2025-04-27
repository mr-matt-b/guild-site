import { useQuery } from "@tanstack/react-query";

interface Character {
  name: string;
  realm: string;
  achievementPoints: number;
  equippedItemLevel: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const fetchTopCharacters = async (): Promise<Character[]> => {
  const response = await fetch(
    `${API_BASE_URL}/guild/top-characters/achievement-points`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch top characters");
  }
  return response.json();
};

const fetchTopCharactersByItemLevel = async (): Promise<Character[]> => {
  const response = await fetch(
    `${API_BASE_URL}/guild/top-characters/equipped-item-level`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch top characters by item level");
  }
  return response.json();
};

export const useTopCharacters = () => {
  return useQuery({
    queryKey: ["topCharactersByAchievementPoints"],
    queryFn: fetchTopCharacters,
  });
};

export const useTopCharactersByItemLevel = () => {
  return useQuery({
    queryKey: ["topCharactersByEquippedItemLevel"],
    queryFn: fetchTopCharactersByItemLevel,
  });
};
