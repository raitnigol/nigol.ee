import Navbar from "./Navbar";
import Transition from "./Transition";
import { Analytics } from "@vercel/analytics/react";
import { useRouter } from 'next/router';
import BeholdWidget from "../components/BeholdWidget";

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const router = useRouter();

  return (
    <div className="md:container md:px-0 mx-auto my-24 px-8 text-white text-xl">
      <Navbar />
      <main>
        <Transition>{children}</Transition>
        {router.pathname === '/' && <BeholdWidget />}
      </main>
      <Analytics />
    </div>
  );
}
