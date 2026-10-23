import { PrayerFlagStripe } from "@/components/brand/PrayerFlagStripe";

/**
 * Player screen frame: phone-width column (390px design width, full width on phones)
 * with the prayer-flag stripe across the top.
 */
export function PhoneShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-page sm:border-x-2 sm:border-ink/10">
        <PrayerFlagStripe />
        <main className={`flex flex-1 flex-col gap-3.5 px-5 pb-6 pt-5 ${className ?? ""}`}>{children}</main>
      </div>
    </div>
  );
}
