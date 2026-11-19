export const REFERRAL_TARGET = 2;

export type ReferralStats = {
  pending: number;
  qualified: number;
  rewarded: number;
  rewardedAt: string | null;
};

export type ReferralProgress = {
  /** Ile osób liczy się do nagrody (zakwalifikowane + już nagrodzone). */
  counted: number;
  target: number;
  remaining: number;
  rewardGranted: boolean;
};

/**
 * Jedna nagroda na konto: po jej odebraniu progres pokazuje 2/2 i nie
 * zachęcamy do kolejnych poleceń.
 */
export function referralProgress(stats: ReferralStats): ReferralProgress {
  const counted = Math.max(0, stats.qualified + stats.rewarded);
  const rewardGranted = Boolean(stats.rewardedAt) || stats.rewarded > 0;

  return {
    counted: Math.min(REFERRAL_TARGET, counted),
    target: REFERRAL_TARGET,
    remaining: Math.max(0, REFERRAL_TARGET - counted),
    rewardGranted,
  };
}
