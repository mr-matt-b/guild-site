import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CharacterViewer from "./CharacterViewer";
import {
  useCharacter,
  useCharacterEquipment,
  useItemsMedia,
  useItemsAppearances,
  useGuildRoster,
} from "../api/wowApi";

interface GuildMember {
  name: string;
  realm: string;
}

interface GuildRosterMember {
  character: {
    name: string;
    level: number;
    realm: {
      slug: string;
    };
  };
  rank: number;
}

interface GuildRosterData {
  members: GuildRosterMember[];
}

interface EquippedItem {
  item: {
    id: number;
  };
  inventory_type: {
    type: string;
  };
}

// Mapping of slot types to their corresponding numbers
// Format: Slot Name: Slot Number (Visible in model viewer?)
const SLOT_NUMBERS: Record<string, number> = {
  HEAD: 1, // Yes
  NECK: 2, // No
  SHOULDER: 3, // Yes
  BODY: 4, // Yes
  CHEST: 5, // Yes
  WAIST: 6, // Yes
  LEGS: 7, // Yes
  FEET: 8, // Yes
  WRIST: 9, // Yes
  HAND: 10, // Yes
  FINGER_1: 11, // No
  FINGER_2: 12, // No
  TRINKET_1: 13, // No
  TRINKET_2: 14, // No
  CLOAK: 16, // Yes
  TWOHWEAPON: 17, // Yes
  TABARD: 19, // Yes
  ROBE: 20, // Yes
  WEAPONMAINHAND: 21, // Yes
  WEAPONOFFHAND: 22, // Yes
  RANGED: 26, // Yes
};

// Mapping of gender strings to their corresponding numbers
const GENDER_MAP: Record<string, number> = {
  MALE: 0,
  FEMALE: 1,
};

interface RandomGuildMemberProps {
  onLoad?: (character: { name: string; realm: string }) => void;
}

const RandomGuildMember: React.FC<RandomGuildMemberProps> = React.memo(
  ({ onLoad }) => {
    const [searchParams] = useSearchParams();
    const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
    const [selectedMember, setSelectedMember] = useState<GuildMember | null>(
      null
    );

    // Memoize the URL parameters together to prevent multiple effect runs
    const urlMember = useMemo(() => {
      const name = searchParams.get("name");
      const realm = searchParams.get("realm");
      if (name && realm) {
        return {
          name: name.toLowerCase(),
          realm: realm.toLowerCase(),
        };
      }
      return null;
    }, [searchParams]);

    const {
      data: guildRosterData,
      isLoading: isLoadingRoster,
      error: rosterError,
    } = useGuildRoster<GuildRosterData>("arugal", "low-calibre", {
      enabled: !urlMember, // Only fetch guild roster if no URL member
    });

    // Handle URL parameter case
    useEffect(() => {
      if (urlMember) {
        setSelectedMember(urlMember);
      }
    }, [urlMember]);

    // Handle guild member case
    useEffect(() => {
      if (!urlMember && guildRosterData?.members) {
        const level85Members = guildRosterData.members
          .filter(
            (member: GuildRosterMember) =>
              member.character.level === 85 && member.rank >= 7
          )
          .map((member: GuildRosterMember) => ({
            name: member.character.name.toLowerCase(),
            realm: member.character.realm.slug,
          }));

        setGuildMembers(level85Members);

        if (level85Members.length > 0) {
          const randomMember =
            level85Members[Math.floor(Math.random() * level85Members.length)];
          setSelectedMember(randomMember);
        }
      }
    }, [guildRosterData, urlMember]);

    // Use the selected member directly instead of currentMember state
    const {
      data: characterData,
      isLoading: isLoadingCharacter,
      error: characterError,
    } = useCharacter(selectedMember?.realm || "", selectedMember?.name || "");
    const {
      data: characterEquipmentData,
      isLoading: isLoadingEquipment,
      error: equipmentError,
    } = useCharacterEquipment(
      selectedMember?.realm || "",
      selectedMember?.name || ""
    );

    // Memoize the array of item IDs
    const itemIds = useMemo(
      () =>
        characterEquipmentData?.equipped_items.map(
          (item: EquippedItem) => item.item.id
        ) || [],
      [characterEquipmentData]
    );

    // Fetch media data for all items at once
    const {
      data: itemsMediaData,
      isLoading: isLoadingMedia,
      error: mediaError,
    } = useItemsMedia(itemIds);

    // Extract appearance IDs from media data
    const appearanceIds = useMemo(() => {
      if (!itemsMediaData) return [];
      return itemsMediaData
        .map((mediaData) => mediaData?.appearances?.[0]?.id)
        .filter((id): id is number => id !== undefined);
    }, [itemsMediaData]);

    // Fetch appearance data for all items
    const {
      data: itemsAppearanceData,
      isLoading: isLoadingAppearances,
      error: appearanceError,
    } = useItemsAppearances(appearanceIds);

    // Memoize the transformed items array
    const transformedItems = useMemo(() => {
      if (!characterEquipmentData || !itemsMediaData || !itemsAppearanceData)
        return [];

      return characterEquipmentData.equipped_items
        .map((item: EquippedItem, index: number) => {
          const mediaData = itemsMediaData[index];
          const appearanceId = mediaData?.appearances?.[0]?.id;

          // Find the appearance data, if it exists
          const appearanceData = itemsAppearanceData.find(
            (data) => data?.id === appearanceId
          );

          // If we have appearance data, use its display ID, otherwise use the item ID
          const displayId =
            appearanceData?.item_display_info_id || item.item.id;

          // Get the slot number, defaulting to 0 if not found
          const slotNumber = SLOT_NUMBERS[item.inventory_type.type] || 0;

          // Only include items with valid slot numbers
          return slotNumber > 0 ? [slotNumber, displayId] : null;
        })
        .filter(
          (item: [number, number] | null): item is [number, number] =>
            item !== null
        );
    }, [characterEquipmentData, itemsMediaData, itemsAppearanceData]);

    if (
      isLoadingRoster ||
      isLoadingCharacter ||
      isLoadingEquipment ||
      isLoadingMedia ||
      isLoadingAppearances
    ) {
      return <div className="text-center">Loading character...</div>;
    }

    if (
      rosterError ||
      characterError ||
      equipmentError ||
      mediaError ||
      appearanceError
    ) {
      return (
        <div className="text-center text-red-500">
          Error:{" "}
          {rosterError instanceof Error
            ? rosterError.message
            : characterError instanceof Error
            ? characterError.message
            : equipmentError instanceof Error
            ? equipmentError.message
            : mediaError instanceof Error
            ? mediaError.message
            : appearanceError instanceof Error
            ? appearanceError.message
            : "Failed to fetch character data"}
        </div>
      );
    }

    if (
      !characterData ||
      !characterEquipmentData ||
      !selectedMember ||
      !itemsMediaData ||
      !itemsAppearanceData ||
      (!urlMember && guildMembers.length === 0)
    ) {
      return <div className="text-center">No character data available</div>;
    }

    // Ensure all appearance values are numbers
    const appearance = {
      race: Number(characterData.race?.id) || 0,
      gender: GENDER_MAP[characterData.gender?.type] ?? 0,
      skin: Number(characterData.appearance?.skin?.id) || 0,
      face: Number(characterData.appearance?.face?.id) || 0,
      hairStyle: Number(characterData.appearance?.hairStyle?.id) || 0,
      hairColor: Number(characterData.appearance?.hairColor?.id) || 0,
      facialStyle: Number(characterData.appearance?.facialStyle?.id) || 0,
    };

    return (
      <div className="w-full mx-auto absolute bottom-0 left-1/2 -translate-x-1/2">
        <CharacterViewer
          race={appearance.race}
          gender={appearance.gender}
          items={transformedItems}
          skin={appearance.skin}
          face={appearance.face}
          hairStyle={appearance.hairStyle}
          hairColor={appearance.hairColor}
          facialStyle={appearance.facialStyle}
          id={selectedMember.name}
          onRenderComplete={() =>
            onLoad?.({
              name: selectedMember.name,
              realm: selectedMember.realm,
            })
          }
        />
      </div>
    );
  }
);

export default RandomGuildMember;
