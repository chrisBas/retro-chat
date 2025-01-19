import { RefObject, useEffect } from "react";

export default function useClickOutsideEvent<T extends Node>(
  ref: RefObject<T>,
  setClickedInside: (clicked: boolean) => void
) {
  const handleClickOutside: (event: MouseEvent) => void = (event) => {
    if (ref.current && !ref.current?.contains(event.target as Node | null)) {
      setClickedInside(false);
    } else {
      setClickedInside(true);
    }
  };

  useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
}
