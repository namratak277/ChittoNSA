"use client";

import { useEffect } from "react";

/** Keeps the screen awake while `active` (Wake Lock API where supported; does nothing elsewhere). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let stopped = false;

    const request = async () => {
      try {
        await lock?.release();
        lock = await navigator.wakeLock.request("screen");
        if (stopped) await lock.release();
      } catch {
        // Battery saver or an unsupported browser: the screen may dim, which is fine.
      }
    };
    // The browser drops the lock when the tab is hidden, so ask again when it comes back.
    const onVisible = () => {
      if (document.visibilityState === "visible") request();
    };

    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, [active]);
}
