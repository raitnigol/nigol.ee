// pages/index.tsx
import { HomeIcon } from "@heroicons/react/solid";
import differenceInYears from "date-fns/differenceInYears";
import type { InferGetServerSidePropsType } from "next";
import Image from "next/future/image";

import { Clock } from "../components/Clock";
import GenericMeta from "../components/GenericMeta";
import Spotify from "../components/Spotify";
import { socials } from "../data/socials";
import Behold from "../components/BeholdWidget";

const birthday = new Date(2002, 5, 26);

export async function getStaticProps() {
  return {
    props: {
      age: differenceInYears(Date.now(), birthday).toString()
    }
  };
}

export default function Home({
  age
}: InferGetServerSidePropsType<typeof getStaticProps>) {
  return (
    <>
      <GenericMeta
        title="nigol.ee"
        description="Rait Nigol is a system administrator at Estonian Internet Foundation."
      />

      <h1 className="heading mb-2">
        nigol.ee <HomeIcon className="ml-4 h-12 w-12 text-orange-400" />
      </h1>

      <p className="mb-4">
        Hi! I&apos;m Nigol, a{" "}
        <span className="text-blue-400">{age}-year-old sysadmin</span>{" "}
        from <span className="text-rose-400">Tartu</span>, Estonia. <br />
        I am currently employed by <span className="text-blue-400">Estonian Internet Foundation</span>.
        <br />
        <br />
        I have also been part of multiple gaming communities and have acted as a <span className="text-rose-400">middleman since 2016</span>, overseeing and facilitating more than <span className="text-rose-400">1000 successful transactions</span> with a value of more than 50 000 €.
      </p>

      <p className="mb-2 flex flex-wrap gap-2 items-center">
        {socials.map(({ name, image, url }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-6 h-6 hover:opacity-80 transition"
          >
            <Image
              src={image}
              alt={name}
              width={64}
              height={64}
              priority={true}
            />
          </a>
        ))}
      </p>

      <p className="mb-4 text-base text-gray-300">
        <Clock />
      </p>

      <hr className="mb-4 bg-slate-800 border-none h-0.5" />

      <div style={{ marginBottom: '30px' }}>
        <Spotify />
      </div>
      <Behold />
    </>
  );
}
