"use client";

import { useEffect, useState } from "react";
import { getUserSubscription } from "@/lib/actions/payment.action";

interface PremiumStatus {
  isPremium: boolean;
  premiumExpiresAt?: string;
  daysRemaining: number;
  loading: boolean;
  error?: string;
}

export function usePremiumStatus(userId?: string): PremiumStatus {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    daysRemaining: 0,
    loading: true,
  });

  useEffect(() => {
    const checkPremium = async () => {
      if (!userId) {
        setStatus({
          isPremium: false,
          daysRemaining: 0,
          loading: false,
        });
        return;
      }

      try {
        const result = await getUserSubscription(userId);
        setStatus({
          isPremium: result.isPremium || false,
          premiumExpiresAt: result.premiumExpiresAt,
          daysRemaining: result.daysRemaining || 0,
          loading: false,
          error: result.error,
        });
      } catch (error) {
        setStatus({
          isPremium: false,
          daysRemaining: 0,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to check premium status",
        });
      }
    };

    checkPremium();
  }, [userId]);

  return status;
}
