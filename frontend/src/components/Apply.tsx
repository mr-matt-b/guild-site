import React from "react";
import { Button } from "./ui/button";
import { DiscordLogoIcon } from "@radix-ui/react-icons";

interface ApplyProps {
  discordInviteLink: string;
}

export const Apply: React.FC<ApplyProps> = ({ discordInviteLink }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-background rounded-t-lg shadow-lg">
      <h2 className="text-3xl font-bold text-foreground">Join Us</h2>
      <p className="text-lg text-muted-foreground text-center max-w-2xl">
        Please join our Discord server for more information about joining the
        guild.
      </p>
      <Button
        size="lg"
        onClick={() => window.open(discordInviteLink, "_blank")}
      >
        <DiscordLogoIcon className="w-5 h-5" />
        Join Discord
      </Button>
    </div>
  );
};
