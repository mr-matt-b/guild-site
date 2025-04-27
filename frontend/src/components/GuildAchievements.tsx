import {
  useGuildAchievements,
  useAchievement,
  useAchievementMedia,
} from "../api/wowApi";
import { formatDistanceToNow } from "date-fns";

interface GuildAchievementsProps {
  realm: string;
  guildName: string;
}

interface AchievementDetailsProps {
  achievementId: number;
}

interface RecentEvent {
  achievement: {
    name: string;
    id: number;
  };
  timestamp: number;
}

interface GuildAchievementsData {
  recent_events: RecentEvent[];
}

interface AchievementDetails {
  description?: {
    en_US: string;
  };
  rewards?: {
    items?: Array<{
      name: {
        en_US: string;
      };
    }>;
  };
  category?: {
    name: {
      en_US: string;
    };
  };
}

interface AchievementItemProps {
  event: RecentEvent;
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
      <p className="italic">{achievementData.description?.en_US}</p>
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

const AchievementItem = ({ event }: AchievementItemProps) => {
  const { data: media } = useAchievementMedia(event.achievement.id);
  const completedDate = new Date(event.timestamp);
  const timeAgo = formatDistanceToNow(completedDate, { addSuffix: true });

  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-lg hover:bg-slate-700 transition-colors">
      <div className="h-full flex flex-col justify-between gap-y-4">
        <div className="flex flex-col gap-y-4">
          <div className="flex items-start space-x-4">
            {media?.assets?.[0]?.value && (
              <img
                src={media.assets[0].value}
                alt={event.achievement.name}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start space-x-2">
                  <span className="text-slate-500 text-xs">Achievement</span>
                  <span className="font-semibold text-blue-400">
                    {event.achievement.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <AchievementDetails achievementId={event.achievement.id} />
          </div>
        </div>
        <span className="text-slate-500 text-xs">Completed {timeAgo}</span>
      </div>
    </div>
  );
};

export const GuildAchievements = ({
  realm,
  guildName,
}: GuildAchievementsProps) => {
  const { data, isLoading, error } = useGuildAchievements(realm, guildName);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center text-slate-400">
          Loading guild achievements...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center text-red-400">
          Error loading guild achievements
        </div>
      </div>
    );
  }

  if (!data) return null;

  const guildData = data as GuildAchievementsData;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center font-heading">
        Recent Guild Achievements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guildData.recent_events.map((event) => (
          <AchievementItem
            key={`${event.achievement.id}-${event.timestamp}`}
            event={event}
          />
        ))}
      </div>
    </div>
  );
};
