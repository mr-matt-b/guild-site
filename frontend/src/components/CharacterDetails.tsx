import React from "react";
import { useCharacter } from "../api/wowApi";

interface CharacterDetailsProps {
  realm: string;
  name: string;
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({ realm, name }) => {
  const { data: characterData, isLoading: isLoadingCharacter } = useCharacter(
    realm,
    name
  );

  if (isLoadingCharacter) {
    return (
      <div className="text-center text-gray-400">
        Loading character details...
      </div>
    );
  }

  if (!characterData) {
    return (
      <div className="text-center text-red-400">
        Failed to load character details
      </div>
    );
  }

  return (
    <div className="bg-slate-800/70 rounded-lg p-4 shadow-lg backdrop-blur-sm hidden sm:block">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-blue-400">
          {characterData.name}
        </h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-slate-300">
              <span className="text-slate-400">Realm:</span>{" "}
              {characterData.realm.name.en_US}
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Race:</span>{" "}
              {characterData.race.name.en_US}
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Class:</span>{" "}
              {characterData.character_class.name.en_US}
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Level:</span>{" "}
              {characterData.level}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-300">
              <span className="text-slate-400">Achievement Points:</span>{" "}
              <span className="text-yellow-400">
                {characterData.achievement_points}
              </span>
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Equipped Item Level:</span>{" "}
              <span className="text-yellow-400">
                {characterData.equipped_item_level}
              </span>
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Faction:</span>{" "}
              {characterData.faction.type.en_US === "ALLIANCE" ? (
                <span className="text-blue-400">Alliance</span>
              ) : (
                <span className="text-red-400">Horde</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetails;
