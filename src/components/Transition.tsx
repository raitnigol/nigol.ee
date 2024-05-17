import { useEffect } from "preact/hooks";
import { PropsWithChildren, useState } from "react";

export default function Transition({ children }: PropsWithChildren<{}>) {
  const [currentChild, setCurrentChild] = useState(children);

  useEffect(() => {
    if (currentChild === children) return;

    const id = setTimeout(() => {
      setCurrentChild(children);
    }, 200);

    return () => clearTimeout(id);
  }, [children, currentChild]);

  return (
    <div>
      {currentChild}
    </div>
  );
}
