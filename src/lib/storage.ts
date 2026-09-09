"use client";

import { Capsule, MAX_STORED_CAPSULES, STORAGE_KEY } from "./types";
import { deleteVoiceMemo } from "./voiceStore";

const CHANGE_EVENT = "fromme-storage";

let cacheRaw: string | null = null;
let cacheParsed: Capsule[] = [];

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

function readCapsules(): Capsule[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cacheRaw) return cacheParsed;
    cacheRaw = raw;
    if (!raw) {
      cacheParsed = [];
      return cacheParsed;
    }
    const parsed = JSON.parse(raw) as Capsule[];
    cacheParsed = Array.isArray(parsed) ? parsed : [];
    return cacheParsed;
  } catch {
    cacheRaw = null;
    cacheParsed = [];
    return cacheParsed;
  }
}

export function getCapsules(): Capsule[] {
  return readCapsules();
}

export function getCapsuleById(id: string): Capsule | null {
  return readCapsules().find((c) => c.id === id) ?? null;
}

/** @returns true if persisted */
export function saveCapsule(capsule: Capsule): boolean {
  if (!canUseStorage()) return false;
  try {
    const previous = readCapsules();
    const others = previous.filter((c) => c.id !== capsule.id);
    const next = [capsule, ...others].slice(0, MAX_STORED_CAPSULES);
    const dropped = previous.filter((c) => !next.some((n) => n.id === c.id));
    const raw = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cacheRaw = raw;
    cacheParsed = next;
    emitChange();
    for (const old of dropped) {
      if (old.hasVoiceMemo) {
        void deleteVoiceMemo(old.id).catch(() => undefined);
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function updateCapsule(
  id: string,
  patch: Partial<
    Pick<
      Capsule,
      | "promiseAccepted"
      | "promiseCompleted"
      | "result"
      | "actionOutcome"
      | "hasVoiceMemo"
    >
  >,
): Capsule | null {
  if (!canUseStorage()) return null;
  try {
    const capsules = [...readCapsules()];
    const index = capsules.findIndex((c) => c.id === id);
    if (index < 0) return null;

    const updated: Capsule = {
      ...capsules[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    capsules[index] = updated;
    const raw = JSON.stringify(capsules);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cacheRaw = raw;
    cacheParsed = capsules;
    emitChange();
    return updated;
  } catch {
    return null;
  }
}

export function subscribeCapsules(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
