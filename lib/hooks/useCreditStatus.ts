import { useCallback, useEffect, useState } from "react";
import {
  getUserCredits,
  hasEnoughCredits,
  deductCredits,
} from "@/lib/actions/credits.action";

interface CreditStatus {
  available: number;
  used: number;
  remaining: number;
  monthly_limit?: number;
  refresh_date?: string;
}

interface CreditCheckResult {
  canUse: boolean;
  available: number;
  needed: number;
  error?: string;
}

/**
 * Hook to manage user credit status
 */
export function useCreditStatus(userId?: string) {
  const [credits, setCredits] = useState<CreditStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysUntilRefresh, setDaysUntilRefresh] = useState(30);

  // Fetch user credits
  useEffect(() => {
    if (!userId) return;

    const fetchCredits = async () => {
      setLoading(true);
      const result = await getUserCredits(userId);

      if (result.success && result.credits) {
        setCredits(result.credits);
        setDaysUntilRefresh(result.daysUntilRefresh || 30);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch credits");
      }
      setLoading(false);
    };

    fetchCredits();
  }, [userId]);

  // Check if user has enough credits for action
  const checkCredits = useCallback(
    async (
      feature: string,
      creditsNeeded: number
    ): Promise<CreditCheckResult> => {
      if (!userId) {
        return {
          canUse: false,
          available: 0,
          needed: creditsNeeded,
          error: "User not authenticated",
        };
      }

      const hasEnough = await hasEnoughCredits(userId, feature, creditsNeeded);
      const available = credits?.available || 0;

      return {
        canUse: hasEnough,
        available,
        needed: creditsNeeded,
        error: hasEnough
          ? undefined
          : `Insufficient credits. Need ${creditsNeeded}, have ${available}`,
      };
    },
    [userId, credits?.available]
  );

  // Deduct credits for an action
  const useCredits = useCallback(
    async (feature: string, creditsToDeduct: number, description: string) => {
      if (!userId) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const result = await deductCredits({
        userId,
        feature,
        credits: creditsToDeduct,
        description,
      });

      if (result.success) {
        // Update local state
        setCredits((prev) =>
          prev
            ? {
                ...prev,
                available: result.newBalance || 0,
                remaining: result.newBalance || 0,
                used: (prev.used || 0) + creditsToDeduct,
              }
            : null
        );
      }

      return result;
    },
    [userId]
  );

  // Refresh credits manually
  const refresh = useCallback(() => {
    if (!userId) return;
    fetchCredits();
  }, [userId]);

  const fetchCredits = async () => {
    const result = await getUserCredits(userId!);
    if (result.success && result.credits) {
      setCredits(result.credits);
      setDaysUntilRefresh(result.daysUntilRefresh || 30);
    }
  };

  return {
    credits,
    loading,
    error,
    daysUntilRefresh,
    checkCredits,
    useCredits,
    refresh,
  };
}

/**
 * Hook to check if feature is available
 */
export function useFeatureAvailability(
  userId?: string,
  feature?: string,
  creditsNeeded: number = 0
) {
  const { credits, loading, error, checkCredits } = useCreditStatus(userId);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId || !feature || creditsNeeded === 0) return;

    const check = async () => {
      const result = await checkCredits(feature, creditsNeeded);
      setAvailable(result.canUse);
    };

    check();
  }, [userId, feature, creditsNeeded, checkCredits]);

  return {
    available,
    loading,
    error,
  };
}
