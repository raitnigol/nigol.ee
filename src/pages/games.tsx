import { SparklesIcon } from "@heroicons/react/solid";
import Image from "next/future/image";
import { useEffect, useState } from "react";

import GenericMeta from "../components/GenericMeta";
import { games } from "../data/games";

// Define the interface for a single game
export interface GameInfo {
  name: string;
  description: string;
  image: string;
  url: string;
}

// Function to shuffle an array in place
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Games() {
  const [shuffledGames, setShuffledGames] = useState<GameInfo[]>([]); // Provide initial state

  useEffect(() => {
    // Shuffle the games array and store it in the state
    setShuffledGames(shuffleArray([...games]));
  }, []);

  return (
    <>
      <GenericMeta
        title="Games ✨"
        description="PC and console games I have completed"
      />

      <h1 className="heading mb-2">
        Games{" "}
        <SparklesIcon className="ml-4 h-12 w-12 text-yellow-300" />
      </h1>

      <p className="text-lg mb-4">PC and console games I have completed.</p>

      {shuffledGames.map(({ name, description, image, url }, i) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="group relative flex items-center justify-items-start h-40 px-4 sm:px-8 mb-4 overflow-hidden bg-slate-900 rounded-lg before:absolute before:inset-0 before:z-10 before:bg-black before:opacity-0 before:transition before:duration-300 hover:before:opacity-50"
        >
          <Image
            src={image}
            alt={name}
            width={1200}
            height={240}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-lg transition duration-300 group-hover:scale-[1.02]"
            priority={i < 3}
          />
          <div className="z-20 w-full transition duration-300 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100">
            <h2 className="font-bold text-3xl">{name}</h2>
            <p className="text-lg">{description}</p>
          </div>
        </a>
      ))}
    </>
  );
}
