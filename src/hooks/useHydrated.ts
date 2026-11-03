"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // zustand persist rehydrates synchronously on client in v5
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);
  return hydrated;
}
