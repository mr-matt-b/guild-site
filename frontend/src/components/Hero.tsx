import React, { useCallback, useState, useEffect } from "react";
import RandomGuildMember from "./RandomGuildMember";
import CharacterDetails from "./CharacterDetails";
import { Switch } from "./ui/switch";

const Hero: React.FC = () => {
  const [shouldLoadCharacter, setShouldLoadCharacter] = useState(() => {
    const saved = localStorage.getItem("shouldLoadCharacter");
    return saved ? JSON.parse(saved) : true;
  });
  const [isLoading, setIsLoading] = useState(shouldLoadCharacter);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<{
    name: string;
    realm: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "shouldLoadCharacter",
      JSON.stringify(shouldLoadCharacter)
    );
  }, [shouldLoadCharacter]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "17px"; // Typical scrollbar width
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0";
    };
  }, [isLoading]);

  const onLoad = useCallback((character: { name: string; realm: string }) => {
    setSelectedCharacter(character);
    setIsAnimating(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Animation duration
  }, []);

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-1000 ease-in-out ${
            isAnimating ? "translate-y-[-100%]" : ""
          }`}
        >
          <div className="text-white text-2xl font-bold animate-pulse">
            Loading...
          </div>
        </div>
      )}
      <div className="w-full pb-4 flex flex-col justify-center items-center isolate relative overflow-visible">
        <div className="relative w-full">
          <span className="text-[2rem] md:text-[3rem] xl:text-[4rem] leading-[0.6] font-bold font-heading text-center text-slate-800 absolute z-[-1] m-8">
            WE ARE
          </span>
          <span className="text-[12rem] md:text-[32rem] xl:text-[48rem] 2xl:text-[60rem] leading-[0.6] font-bold font-heading text-center text-red-500 z-1 w-full block">
            LOW
          </span>
        </div>
        <div className="relative w-full -z-1">
          <span className="text-[8rem] md:text-[20rem] xl:text-[32rem] 2xl:text-[40rem]  leading-[0.2] font-bold font-heading text-center text-slate-800 absolute left-1/2 -translate-x-1/2">
            FUCKING
          </span>
        </div>
        <div className="relative w-full">
          <span className="text-[8rem] md:text-[20rem] xl:text-[28rem] 2xl:text-[36rem] leading-[1] font-bold font-heading text-center text-red-500 z-1 w-full block">
            CALIBRE
          </span>
        </div>
      </div>
      <div
        className="relative bottom-0 left-1/2 -translate-x-1/2 w-full"
        style={{ perspective: "1000px" }}
      >
        <span
          className="text-5xl font-bold font-heading text-center text-slate-300 z-1 w-full block"
          style={{ transform: "rotateX(60deg)" }}
        >
          Living up to our name since 2019.
        </span>
      </div>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="absolute top-0 right-0 z-10 ">
          <div className="flex items-center justify-center gap-2 p-2 ">
            <span className="text-slate-300">Load Character Model</span>
            <Switch
              checked={shouldLoadCharacter}
              onCheckedChange={setShouldLoadCharacter}
            />
          </div>
          {selectedCharacter && (
            <CharacterDetails
              realm={selectedCharacter.realm}
              name={selectedCharacter.name}
            />
          )}
        </div>
      </div>

      {shouldLoadCharacter && <RandomGuildMember onLoad={onLoad} />}
    </div>
  );
};

export default Hero;
