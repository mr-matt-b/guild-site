import { useTopCharactersByItemLevel } from "../api/guildApi";
import { capitalizeName } from "../lib/helpers";

export const EquippedItemLevelPodium = () => {
  const { data: characters, isLoading, error } = useTopCharactersByItemLevel();

  if (isLoading) {
    return (
      <div className="text-center text-gray-400">Loading leaderboard...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400">Error loading leaderboard</div>
    );
  }

  if (!characters || characters.length === 0) {
    return <div className="text-center text-gray-400">No characters found</div>;
  }

  // Sort characters by item level in descending order
  const sortedCharacters = [...characters].sort(
    (a, b) => b.equippedItemLevel - a.equippedItemLevel
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center font-heading">
        Equipped Item Level
      </h2>
      <div className="space-y-4">
        {sortedCharacters.map((character, index) => {
          // Calculate the width based on position (higher item level = wider bar)
          const widthPercentage = 100 - index * (50 / sortedCharacters.length);
          const barColor = index === 0 ? "bg-slate-600" : "bg-background";

          return (
            <div
              key={`${capitalizeName(character.name)}-${character.realm}`}
              className="relative"
            >
              <div
                className={`${barColor} rounded-r-lg p-3 transition-all duration-500`}
                style={{ width: `${widthPercentage}%` }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-lg font-semibold text-blue-400">
                        {capitalizeName(character.name)}
                      </span>
                      <span className="text-sm text-muted-foreground  ml-2">
                        {character.realm}
                      </span>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-bold text-lg">
                    {character.equippedItemLevel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
