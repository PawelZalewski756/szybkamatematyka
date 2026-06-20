"use client";

import {
  getDisplayProgress,
  type GameAccountState,
} from "@/lib/minigry/account-progress";
import { getSupabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/supabase/profiles";
import { useCallback, useEffect, useState } from "react";

export function useGameAccount() {
  const [account, setAccount] = useState<GameAccountState | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccount = useCallback(async () => {
    setLoading(true);

    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setAccount({ profile: null, isLoggedIn: false });
        return;
      }

      const profile = await ensureUserProfile(session.user);
      setAccount({ profile, isLoggedIn: true });
    } catch {
      setAccount({
        profile: null,
        isLoggedIn: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshAccount();
  }, [refreshAccount]);

  return {
    account,
    loading,
    refreshAccount,
    displayProgress: account
      ? getDisplayProgress(account)
      : { level: 1, xp: 0 },
  };
}
