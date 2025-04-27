interface Key {
  href: string;
}

interface LocalizedName {
  en_US: string;
  [key: string]: string;
}

interface Realm {
  key: Key;
  name: LocalizedName;
  id: number;
  slug: string;
}

interface Character {
  key: Key;
  name: string;
  id: number;
  realm: Realm;
}

interface Achievement {
  key: Key;
  name: LocalizedName;
  id: number;
}

interface CharacterAchievement {
  character: Character;
  achievement: Achievement;
}

interface ActivityType {
  type: string;
}

interface GuildActivity {
  character_achievement?: CharacterAchievement;
  activity: ActivityType;
  timestamp: number;
}

interface AchievementRewardItem {
  name: LocalizedName;
  id: number;
}

interface AchievementRewards {
  items?: AchievementRewardItem[];
}

interface AchievementDetails {
  id: number;
  name: LocalizedName;
  description: LocalizedName;
  rewards?: AchievementRewards;
}

interface GuildActivityResponse {
  _links: {
    self: {
      href: string;
    };
  };
  guild: {
    key: Key;
    name: LocalizedName;
    id: number;
    realm: Realm;
    faction: {
      type: string;
      name: LocalizedName;
    };
  };
  activities: GuildActivity[];
}

export type { GuildActivity, GuildActivityResponse, AchievementDetails };
