import "./index.css";

import Hero from "./components/Hero";
import { GuildActivity } from "./components/GuildActivity";
import { AchievementPodium } from "./components/AchievementPodium";
import { EquippedItemLevelPodium } from "./components/EquippedItemLevelPodium";
import { GuildAchievements } from "./components/GuildAchievements";
import { Apply } from "./components/Apply";
function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-900 text-red-500 overflow-hidden">
      <main className="container mx-auto">
        <div className="relative space-y-12">
          <Hero />
          <GuildActivity realm="arugal" guildName="low-calibre" />
          <GuildAchievements realm="arugal" guildName="low-calibre" />
          <AchievementPodium />
          <EquippedItemLevelPodium />
          <Apply discordInviteLink="https://discord.gg/lowcalibre" />
        </div>
      </main>
    </div>
  );
}

export default App;
