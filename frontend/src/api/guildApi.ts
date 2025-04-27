import { useQuery } from "@tanstack/react-query";

interface Character {
  name: string;
  realm: string;
  achievementPoints: number;
  equippedItemLevel: number;
}

const fetchTopCharacters = async (): Promise<Character[]> => {
  const response = await fetch("/api/guild/top-characters/achievement-points");
  if (!response.ok) {
    throw new Error("Failed to fetch top characters");
  }
  return response.json();
};

const fetchTopCharactersByItemLevel = async (): Promise<Character[]> => {
  const response = await fetch("/api/guild/top-characters/equipped-item-level");
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
