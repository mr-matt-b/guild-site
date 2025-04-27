import React, { useState } from "react";
import CharacterViewer from "./CharacterViewer";

interface Character {
  name: string;
  realm: string;
  race: number;
  gender: number;
  items: [number, number][];
  skin?: number;
  face?: number;
  hairStyle?: number;
  hairColor?: number;
  facialStyle?: number;
}

interface CharacterCarouselProps {
  characters: Character[];
}

const CharacterCarousel: React.FC<CharacterCarouselProps> = ({
  characters,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCharacter = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length);
  };

  const prevCharacter = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + characters.length) % characters.length
    );
  };

  const currentCharacter = characters[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-5 h-[80vh]">
      <div className="flex justify-between items-center mb-5">
        <button
          onClick={prevCharacter}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          &lt; Previous
        </button>
        <span className="text-xl font-semibold">
          {currentCharacter.name} - {currentCharacter.realm}
        </span>
        <button
          onClick={nextCharacter}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Next &gt;
        </button>
      </div>
      <div className="h-[calc(80vh-4rem)]">
        <CharacterViewer
          race={currentCharacter.race}
          gender={currentCharacter.gender}
          items={currentCharacter.items}
          skin={currentCharacter.skin ?? 0}
          face={currentCharacter.face ?? 0}
          hairStyle={currentCharacter.hairStyle ?? 0}
          hairColor={currentCharacter.hairColor ?? 0}
          facialStyle={currentCharacter.facialStyle ?? 0}
          id={currentCharacter.name}
        />
      </div>
    </div>
  );
};

export default CharacterCarousel;
