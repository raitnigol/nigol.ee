import Navbar from "./Navbar";
import Transition from "./Transition";
import { Analytics } from "@vercel/analytics/react";

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="md:container md:px-0 mx-auto my-24 px-8 text-white text-xl">
      <Navbar />
      <main>
        <Transition>{children}</Transition>
      </main>
      <Analytics />
    </div>
  );
}
