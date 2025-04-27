import { useTopCharacters } from "../api/guildApi";
import { capitalizeName } from "../lib/helpers";

export const AchievementPodium = () => {
  const { data: characters, isLoading, error } = useTopCharacters();

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading podium...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400">Error loading podium</div>;
  }

  if (!characters || characters.length === 0) {
    return <div className="text-center text-gray-400">No characters found</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center font-heading">
        Achievement Points Leaderboard
      </h2>
      <div className="flex items-end justify-center gap-4 h-64">
        {/* Second place */}
        {characters[1] && (
          <div className="flex flex-col items-center w-1/3">
            <div className="bg-slate-700 rounded-t-lg p-4 w-full h-48 flex flex-col items-center justify-end">
              <span className="text-4xl font-bold font-heading text-slate-300">
                2
              </span>
              <span className="text-xl font-semibold text-blue-400 mt-2">
                {capitalizeName(characters[1].name)}
              </span>
              <span className="text-sm text-muted-foreground">
                {characters[1].realm}
              </span>
              <span className="text-yellow-400 font-bold mt-2">
                {characters[1].achievementPoints.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* First place */}
        {characters[0] && (
          <div className="flex flex-col items-center w-1/3">
            <div className="bg-slate-600 rounded-t-lg p-4 w-full h-64 flex flex-col items-center justify-end">
              <span className="text-4xl  font-heading font-bold text-yellow-400">
                1
              </span>
              <span className="text-2xl font-semibold text-blue-400 mt-2">
                {capitalizeName(characters[0].name)}
              </span>
              <span className="text-sm text-muted-foreground">
                {characters[0].realm}
              </span>
              <span className="text-yellow-400 font-bold mt-2">
                {characters[0].achievementPoints.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Third place */}
        {characters[2] && (
          <div className="flex flex-col items-center w-1/3">
            <div className="bg-slate-700 rounded-t-lg p-4 w-full h-32 flex flex-col items-center justify-end">
              <span className="text-4xl font-bold font-heading text-amber-600">
                3
              </span>
              <span className="text-xl font-semibold text-blue-400 mt-2">
                {capitalizeName(characters[2].name)}
              </span>
              <span className="text-sm text-muted-foreground">
                {characters[2].realm}
              </span>
              <span className="text-yellow-400 font-bold mt-2">
                {characters[2].achievementPoints.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the top 10 */}
      {characters.length > 3 && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.slice(3).map((character) => (
              <div
                key={`${character.name}-${character.realm}`}
                className="bg-slate-800 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold text-blue-400">
                      {capitalizeName(character.name)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {character.realm}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-bold">
                    {character.achievementPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
