"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getCapsuleById,
  getCapsules,
  subscribeCapsules,
} from "./storage";
import { Capsule } from "./types";

/** localStorage 읽기 전 hydration 깜빡임 방지 */
export function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useCapsules(): Capsule[] {
  return useSyncExternalStore(subscribeCapsules, getCapsules, () => []);
}

export function useCapsule(id: string): Capsule | null {
  const getSnapshot = useCallback(() => getCapsuleById(id), [id]);
  return useSyncExternalStore(subscribeCapsules, getSnapshot, () => null);
}
