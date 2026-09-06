"use client";

import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import { getSupabaseOrNull } from "@/lib/supabase";
import {
  fetchSubscriptionSnapshotForUser,
  subscriptionSnapshotFromProfile,
} from "@/lib/supabase/profiles";
import {
  FREE_SUBSCRIPTION,
  isPro as snapshotIsPro,
  type SubscriptionSnapshot,
} from "@/lib/subscription/status";
import { useCallback, useEffect, useState } from "react";

export type SubscriptionState = {
  loading: boolean;
  isLoggedIn: boolean;
  isPro: boolean;
  snapshot: SubscriptionSnapshot;
  refresh: () => Promise<void>;
};

/**
 * Hook czytający status subskrypcji bieżącego użytkownika.
 *
 * Źródłem prawdy jest kolumna `profiles.subscription_status` (zapisywana przez
 * webhook Stripe i odczytywana przez bezpieczne RPC właściciela). Hook słucha
 * też zmian sesji Supabase, więc UI odświeża się po (od)zalogowaniu. Działa
 * bezpiecznie bez konfiguracji Supabase — wtedy zwraca stan „niezalogowany / free".
 */
export function useSubscription(): SubscriptionState {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [snapshot, setSnapshot] =
    useState<SubscriptionSnapshot>(FREE_SUBSCRIPTION);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseOrNull();
    if (!supabase) {
      setIsLoggedIn(false);
      setSnapshot(FREE_SUBSCRIPTION);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setIsLoggedIn(false);
        setSnapshot(FREE_SUBSCRIPTION);
        return;
      }
      setIsLoggedIn(true);
      const nextSnapshot = await fetchSubscriptionSnapshotForUser(user.id);
      setSnapshot(nextSnapshot);
    } catch {
      setIsLoggedIn(false);
      setSnapshot(FREE_SUBSCRIPTION);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();

    const supabase = getSupabaseOrNull();

    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      if (detail?.profile?.subscriptionStatus !== undefined) {
        setSnapshot(subscriptionSnapshotFromProfile(detail.profile));
      }
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);

    const authListener = supabase?.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
      authListener?.data.subscription.unsubscribe();
    };
  }, [refresh]);

  return {
    loading,
    isLoggedIn,
    isPro: snapshotIsPro(snapshot),
    snapshot,
    refresh,
  };
}
