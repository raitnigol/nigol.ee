import { useEffect } from "preact/hooks";
import { PropsWithChildren, useState } from "react";

export default function Transition({ children }: PropsWithChildren<{}>) {
  const [currentChild, setCurrentChild] = useState(children);

  useEffect(() => {
    if (currentChild === children) return;

    const id = setTimeout(() => {
      setCurrentChild(children);
    }, 200);

    return () => clearTimeout(id); // Cleanup the timeout if the component unmounts or children changes

  }, [children, currentChild]);

  return (
    // Render the current child
    {currentChild}
  );
}
