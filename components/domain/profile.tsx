import { cn } from "@/lib/utils";
import { PROFILES, type ProfileCode } from "@/lib/domain/profiles";

/** One colour per profile, all at least 4.5:1 against the white page. */
export const PROFILE_COLOR: Record<ProfileCode, string> = {
  A: "var(--profile-a)",
  B: "var(--profile-b)",
  C: "var(--profile-c)",
  D: "var(--profile-d)",
  E: "var(--profile-e)",
  F: "var(--profile-f)",
};

/** Bars and dots repeat the profile letter, so the chart works without colour too. */
export function ProfileTag({
  code,
  withName = true,
  withIcon = true,
  name,
  className,
}: {
  code: ProfileCode;
  withName?: boolean;
  withIcon?: boolean;
  /** Text shown instead of the profile name, for example its declined form or its role. */
  name?: string;
  className?: string;
}) {
  const profile = PROFILES[code];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
        style={{ backgroundColor: PROFILE_COLOR[code] }}
        aria-hidden="true"
      >
        {code}
      </span>
      {withIcon ? <span aria-hidden="true">{profile.icon}</span> : null}
      <span className={withName ? undefined : "sr-only"}>{name ?? profile.name}</span>
    </span>
  );
}
