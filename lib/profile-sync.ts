import type { Profile } from "@/lib/supabase/profiles";

export const PROFILE_UPDATED_EVENT = "szybka-matma-profile-updated";

export type ProfileUpdatedDetail = {
  profile: Profile;
};

/** Powiadamia navbar i inne komponenty o nowym XP / poziomie. */
export function notifyProfileUpdated(profile: Profile): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ProfileUpdatedDetail>(PROFILE_UPDATED_EVENT, {
      detail: { profile },
    }),
  );
}
