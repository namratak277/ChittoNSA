"use client";

import { useState } from "react";

interface DemoNavProps<T extends string> {
  screens: readonly { id: T; label: string }[];
  current: T;
  onChange: (id: T) => void;
}

/**
 * Milestone 2 only: jump straight to any static screen. Replaced by the live game state later.
 * A small tab in the top-right corner that opens a screen picker, so it doesn't hide the screen being tested.
 */
export function DemoNav<T extends string>({ screens, current, onChange }: DemoNavProps<T>) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed right-0 top-0 z-50 flex items-start gap-1 text-xs font-bold">
      {open && (
        <label className="mt-1 flex items-center gap-1.5 rounded-lg border-2 border-ink bg-white px-2 py-1 shadow-ink-sm">
          Screen
          <select
            autoFocus
            value={current}
            onChange={(e) => {
              onChange(e.target.value as T);
              setOpen(false);
            }}
            className="min-h-8 rounded-md border-2 border-ink bg-white px-1 text-xs"
          >
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="min-h-7 cursor-pointer rounded-bl-lg border-0 bg-ink/70 px-2.5 text-xs font-bold text-white hover:bg-ink"
      >
        {open ? "Close" : "Demo ▾"}
      </button>
    </div>
  );
}
