import { useEffect, useState } from "react";

/**
 * Hook to check if the component has been mounted (client-side).
 * Prevents hydration mismatches by delaying render until after mount.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
