import {
  useGuildActivity,
  useAchievement,
  useAchievementMedia,
} from "../api/wowApi";
import { formatDistanceToNow } from "date-fns";
import { GuildActivityResponse } from "../types/wow";
import type { AchievementDetails } from "../types/wow";

interface GuildActivityProps {
  realm: string;
  guildName: string;
}

interface AchievementDetailsProps {
  achievementId: number;
}

interface ActivityItemProps {
  activity: GuildActivityResponse["activities"][0];
}

const AchievementDetails = ({ achievementId }: AchievementDetailsProps) => {
  const { data: achievement, isLoading: isAchievementLoading } =
    useAchievement(achievementId);

  if (isAchievementLoading)
    return <div className="text-sm text-slate-500">Loading details...</div>;
  if (!achievement) return null;

  const achievementData = achievement as AchievementDetails;

  return (
    <div className="text-sm text-slate-400">
      <p className="italic">{achievementData.description.en_US}</p>
      {achievementData.rewards?.items && (
        <div className="mt-1">
          <span className="font-semibold">Rewards: </span>
          {achievementData.rewards.items
            .map((item) => item.name.en_US)
            .join(", ")}
        </div>
      )}
    </div>
  );
};

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const timestamp = new Date(activity.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  const { data: media } = useAchievementMedia(
    activity.character_achievement?.achievement.id || 0
  );

  if (
    activity.activity.type !== "CHARACTER_ACHIEVEMENT" ||
    !activity.character_achievement
  ) {
    return null;
  }

  const { character, achievement } = activity.character_achievement;

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-lg hover:bg-slate-700 transition-colors">
      <div className="h-full flex flex-col justify-between gap-y-4">
        <div className="flex flex-col gap-y-4">
          <div className="flex items-start space-x-4">
            {media?.assets?.[0]?.value && (
              <img
                src={media.assets[0].value}
                alt={achievement.name.en_US}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start space-x-2">
                  <span className="text-slate-500 text-xs">Achievement</span>
                  <span className="font-semibold text-blue-400">
                    {character.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-yellow-400 font-heading text-lg">
              {achievement.name.en_US}
            </span>
            <AchievementDetails achievementId={achievement.id} />
          </div>
        </div>
        <span className="text-slate-500 text-xs">{timeAgo}</span>
      </div>
    </div>
  );
};

export const GuildActivity = ({ realm, guildName }: GuildActivityProps) => {
  const { data, isLoading, error } = useGuildActivity(realm, guildName);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center text-slate-400">
          Loading guild activity...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center text-red-400">
          Error loading guild activity
        </div>
      </div>
    );
  }

  if (!data) return null;

  const guildData = data as GuildActivityResponse;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center font-heading">
        Recent Guild Activity
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guildData.activities.map((activity) => (
          <ActivityItem key={activity.timestamp} activity={activity} />
        ))}
      </div>
    </div>
  );
};
