import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "/api"}/wow`;

interface CharacterAppearance {
  race: number;
  gender: number;
  skin: number;
  face: number;
  hairStyle: number;
  hairColor: number;
  facialStyle: number;
  items: [number, number][];
}

export const getCharacter = async (realm: string, name: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profile/wow/character/${realm}/${name}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching character:", error);
    throw error;
  }
};

export const getCharacterAppearance = async (realm: string, name: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profile/wow/character/${realm}/${name}/appearance`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching character appearance:", error);
    throw error;
  }
};

export const getCharacterEquipment = async (realm: string, name: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profile/wow/character/${realm}/${name}/equipment`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching character equipment:", error);
    throw error;
  }
};

export const getCharacterMedia = async (realm: string, name: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profile/wow/character/${realm}/${name}/character-media`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching character media:", error);
    throw error;
  }
};

export const getItemMedia = async (itemId: number) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/data/wow/media/item/${itemId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching item media:", error);
    throw error;
  }
};

export const getItemsMedia = async (itemIds: number[]) => {
  try {
    const responses = await Promise.all(
      itemIds.map((itemId) => fetch(`${API_BASE_URL}/data/wow/item/${itemId}`))
    );

    const results = await Promise.all(
      responses.map((response) => {
        if (!response.ok) {
          console.warn(
            `Failed to fetch appearance for ID: ${response.url
              .split("/")
              .pop()}`
          );
          return null;
        }
        return response.json();
      })
    );

    return results;
  } catch (error) {
    console.error("Error fetching items media:", error);
    throw error;
  }
};

export const getItemAppearance = async (appearanceId: number) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/data/wow/item-appearance/${appearanceId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching item appearance:", error);
    throw error;
  }
};

export const getItemsAppearances = async (appearanceIds: number[]) => {
  try {
    const responses = await Promise.all(
      appearanceIds.map((id) =>
        fetch(`${API_BASE_URL}/data/wow/item-appearance/${id}`)
      )
    );

    const results = await Promise.all(
      responses.map(async (response) => {
        if (!response.ok) {
          console.warn(
            `Failed to fetch appearance for ID: ${response.url
              .split("/")
              .pop()}`
          );
          return null;
        }
        return response.json();
      })
    );

    // Filter out null results (failed requests)
    return results.filter(
      (result): result is NonNullable<typeof result> => result !== null
    );
  } catch (error) {
    console.error("Error fetching items appearances:", error);
    return [];
  }
};

export const getGuildRoster = async (realm: string, guildName: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/data/wow/guild/${realm}/${guildName}/roster`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching guild roster:", error);
    throw error;
  }
};

export const getGuildActivity = async (realm: string, guildName: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/data/wow/guild/${realm}/${guildName}/activity`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching guild activity:", error);
    throw error;
  }
};

export const getGuildAchievements = async (
  realm: string,
  guildName: string
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/data/wow/guild/${realm}/${guildName}/achievements`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching guild achievements:", error);
    throw error;
  }
};

export const getAchievement = async (achievementId: number) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/data/wow/achievement/${achievementId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching achievement:", error);
    throw error;
  }
};

export const getAchievementMedia = async (achievementId: number) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/data/wow/media/achievement/${achievementId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Replace classic-us with us in the icon URL - classic api seems a bit broken.
    if (data.assets?.[0]?.value) {
      data.assets[0].value = data.assets[0].value.replace("classic-us", "us");
    }

    return data;
  } catch (error) {
    console.error("Error fetching achievement media:", error);
    throw error;
  }
};

export const getCharacterSpecializations = async (
  realm: string,
  name: string
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profile/wow/character/${realm}/${name}/specializations`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching character specializations:", error);
    throw error;
  }
};

export const getCharacterStatistics = async (realm: string, name: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profile/wow/character/${realm}/${name}/statistics`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching character statistics:", error);
    throw error;
  }
};

export const getCharacterProfessions = async (realm: string, name: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profile/wow/character/${realm}/${name}/professions`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching character professions:", error);
    throw error;
  }
};

export const useCharacter = (realm: string, name: string) => {
  return useQuery({
    queryKey: ["character", realm, name],
    queryFn: () => getCharacter(realm, name),
    enabled: !!realm && !!name,
  });
};

export const useCharacterAppearance = (realm: string, name: string) => {
  return useQuery<CharacterAppearance>({
    queryKey: ["character", realm, name, "appearance"],
    queryFn: () => getCharacterAppearance(realm, name),
    enabled: !!realm && !!name,
  });
};

export const useCharacterMedia = (realm: string, name: string) => {
  return useQuery({
    queryKey: ["character", realm, name, "media"],
    queryFn: () => getCharacterMedia(realm, name),
    enabled: !!realm && !!name,
  });
};

export const useCharacterEquipment = (realm: string, name: string) => {
  return useQuery({
    queryKey: ["character", realm, name, "equipment"],
    queryFn: () => getCharacterEquipment(realm, name),
    enabled: !!realm && !!name,
  });
};

export const useItemMedia = (itemId: number) => {
  return useQuery({
    queryKey: ["itemMedia", itemId],
    queryFn: () => getItemMedia(itemId),
    enabled: !!itemId,
  });
};

export const useItemsMedia = (itemIds: number[]) => {
  return useQuery({
    queryKey: ["itemsMedia", ...itemIds],
    queryFn: () => getItemsMedia(itemIds),
    enabled: itemIds.length > 0,
  });
};

export const useItemAppearance = (appearanceId: number) => {
  return useQuery({
    queryKey: ["itemAppearance", appearanceId],
    queryFn: () => getItemAppearance(appearanceId),
    enabled: !!appearanceId,
  });
};

export const useItemsAppearances = (appearanceIds: number[]) => {
  return useQuery({
    queryKey: ["itemsAppearances", ...appearanceIds],
    queryFn: () => getItemsAppearances(appearanceIds),
    enabled: appearanceIds.length > 0,
  });
};

export const useGuildRoster = <T>(
  realm: string,
  guildName: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<T>({
    queryKey: ["guildRoster", realm, guildName],
    queryFn: () => getGuildRoster(realm, guildName),
    enabled: options?.enabled ?? (!!realm && !!guildName),
  });
};

export const useGuildActivity = (realm: string, guildName: string) => {
  return useQuery({
    queryKey: ["guildActivity", realm, guildName],
    queryFn: () => getGuildActivity(realm, guildName),
    enabled: !!realm && !!guildName,
  });
};

export const useGuildAchievements = (realm: string, guildName: string) => {
  return useQuery({
    queryKey: ["guild", realm, guildName, "achievements"],
    queryFn: () => getGuildAchievements(realm, guildName),
    enabled: !!realm && !!guildName,
  });
};

export const useAchievement = (achievementId: number) => {
  return useQuery({
    queryKey: ["achievement", achievementId],
    queryFn: () => getAchievement(achievementId),
    enabled: !!achievementId,
  });
};

export const useAchievementMedia = (achievementId: number) => {
  return useQuery({
    queryKey: ["achievementMedia", achievementId],
    queryFn: () => getAchievementMedia(achievementId),
    enabled: !!achievementId,
  });
};

export const useCharacterSpecializations = (realm: string, name: string) => {
  return useQuery({
    queryKey: ["character", realm, name, "specializations"],
    queryFn: () => getCharacterSpecializations(realm, name),
    enabled: !!realm && !!name,
  });
};

export const useCharacterStatistics = (realm: string, name: string) => {
  return useQuery({
    queryKey: ["character", realm, name, "statistics"],
    queryFn: () => getCharacterStatistics(realm, name),
    enabled: !!realm && !!name,
  });
};

export const useCharacterProfessions = (realm: string, name: string) => {
  return useQuery({
    queryKey: ["character", realm, name, "professions"],
    queryFn: () => getCharacterProfessions(realm, name),
    enabled: !!realm && !!name,
  });
};
