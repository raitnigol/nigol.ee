// Remove the BeholdWidget import
import Image from "next/future/image";

import { Clock } from "../components/Clock";
import GenericMeta from "../components/GenericMeta";
import Spotify from "../components/Spotify";
import { socials } from "../data/socials";

const EE_DOMAIN_REGISTER_URL =
  "https://www.internet.ee/domains/how-to-register-a-ee-domain-name";

export default function Home() {
  return (
    <>
      <GenericMeta
        title="nigol.ee"
        description="Rait Nigol — Chief Information Security Officer & System Administrator at Estonian Internet Foundation."
      />

      <h1 className="heading mb-2">nigol.ee</h1>

      <p className="mb-3">
        <span className="text-rose-400">Chief Information Security Officer</span>
        {" & "}
        <span className="text-blue-400">System Administrator</span> at{" "}
        <span className="text-blue-400">Estonian Internet Foundation</span>.
      </p>

      <p className="mb-4 text-gray-300">
        You still do not have a <span className="text-rose-400">.ee</span> domain?{" "}
        <a
          href={EE_DOMAIN_REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline underline-offset-2 decoration-blue-400/40 hover:text-blue-300 hover:decoration-blue-300 transition-colors"
        >
          Register one here
        </a>
        .
      </p>

      <p className="mb-4">
        I have also been part of multiple gaming communities and have acted as a{" "}
        <span className="text-rose-400">middleman since 2016</span>, overseeing and
        facilitating more than{" "}
        <span className="text-rose-400">1000 successful transactions</span> with a
        value of more than 50 000 €.
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

      <div style={{ marginBottom: "30px" }}>
        <Spotify />
      </div>
    </>
  );
}
