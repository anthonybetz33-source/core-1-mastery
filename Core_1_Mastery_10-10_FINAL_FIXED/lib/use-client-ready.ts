import { useEffect, useState } from "react";

/** False on SSR and the first client render, then true — avoids shuffle hydration mismatches. */
export function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
