import { useEffect } from "preact/hooks";
import { PropsWithChildren, useState, ReactNode } from "react";

export default function Transition({ children }: PropsWithChildren<{}>): JSX.Element {
  const [currentChild, setCurrentChild] = useState<ReactNode>(children);

  useEffect(() => {
    if (currentChild === children) return;

    const id = setTimeout(() => {
      setCurrentChild(children);
    }, 200);

    return () => clearTimeout(id);
  }, [children, currentChild]);

  return <>{currentChild}</>;
}
