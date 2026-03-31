"use server";

import { db } from "@/firebase/admin";
import { CREDIT_COSTS, CREDIT_ALLOCATIONS } from "@/constants";

/**
 * Grant credits when user purchases premium subscription
 */
export async function grantCredits(
  userId: string,
  planType: "monthly" | "yearly"
) {
  try {
    const allocation =
      CREDIT_ALLOCATIONS[
        planType.toUpperCase() as keyof typeof CREDIT_ALLOCATIONS
      ];

    if (!allocation) {
      return {
        success: false,
        error: "Invalid plan type",
      };
    }

    const now = new Date();
    const refreshDate = new Date(
      now.getTime() + (planType === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
    );

    await db
      .collection("users")
      .doc(userId)
      .update({
        "credits.available": allocation.total,
        "credits.used": 0,
        "credits.remaining": allocation.total,
        "credits.monthly_limit": allocation.interview + allocation.resume,
        "credits.refresh_date": refreshDate.toISOString(),
        "credit_history.lastUpdated": now.toISOString(),
        "credit_history.refillCount": db.FieldValue.increment(1),
      });

    // Log the grant
    await db.collection("credit_logs").add({
      userId,
      action: "credits_granted",
      credits_spent: -allocation.total,
      credits_before: 0,
      credits_after: allocation.total,
      feature: "system",
      timestamp: now.toISOString(),
      description: `${planType} subscription - ${allocation.total} credits granted`,
      status: "completed",
    });

    return {
      success: true,
      credits: allocation.total,
      refreshDate: refreshDate.toISOString(),
    };
  } catch (error) {
    console.error("Error granting credits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to grant credits",
    };
  }
}

/**
 * Check if user has enough credits for an action
 */
export async function hasEnoughCredits(
  userId: string,
  feature: string,
  creditsNeeded: number
): Promise<boolean> {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return false;

    const userData = userDoc.data() as any;
    const available = userData.credits?.available || 0;

    return available >= creditsNeeded;
  } catch (error) {
    console.error("Error checking credits:", error);
    return false;
  }
}

/**
 * Deduct credits from user balance
 */
export async function deductCredits(params: CreditDeductParams) {
  try {
    const { userId, feature, credits, description } = params;

    // Check user exists
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data() as any;
    const currentCredits = userData.credits?.available || 0;

    // Check sufficient balance
    if (currentCredits < credits) {
      return {
        success: false,
        error: "Insufficient credits",
        available: currentCredits,
        needed: credits,
      };
    }

    const newBalance = currentCredits - credits;
    const now = new Date();

    // Update user credits
    await db
      .collection("users")
      .doc(userId)
      .update({
        "credits.available": newBalance,
        "credits.used": db.FieldValue.increment(credits),
        "credits.remaining": newBalance,
        "credit_history.lastUpdated": now.toISOString(),
      });

    // Log the transaction
    await db.collection("credit_logs").add({
      userId,
      action: feature,
      credits_spent: credits,
      credits_before: currentCredits,
      credits_after: newBalance,
      feature,
      timestamp: now.toISOString(),
      description,
      status: "completed",
    });

    return {
      success: true,
      newBalance,
      creditsSpent: credits,
    };
  } catch (error) {
    console.error("Error deducting credits:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to deduct credits",
    };
  }
}

/**
 * Get user credit balance
 */
export async function getUserCredits(userId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data() as any;
    const credits = userData.credits || {
      available: 0,
      used: 0,
      remaining: 0,
    };

    // Check if credits need refresh
    if (credits.refresh_date) {
      const refreshDate = new Date(credits.refresh_date);
      const now = new Date();

      if (now > refreshDate && credits.monthly_limit > 0) {
        // Auto-refresh
        await refreshCredits(userId);
        // Recursive call to get updated data
        return getUserCredits(userId);
      }

      const daysUntilRefresh = Math.ceil(
        (refreshDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      return {
        success: true,
        credits,
        daysUntilRefresh: Math.max(0, daysUntilRefresh),
      };
    }

    return {
      success: true,
      credits,
      daysUntilRefresh: 30,
    };
  } catch (error) {
    console.error("Error getting credits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch credits",
    };
  }
}

/**
 * Refresh credits on subscription renewal
 */
export async function refreshCredits(userId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data() as any;
    const oldBalance = userData.credits?.available || 0;
    const monthlyLimit = userData.credits?.monthly_limit || 170;

    const now = new Date();
    const newRefreshDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await db.collection("users").doc(userId).update({
      "credits.available": monthlyLimit,
      "credits.used": 0,
      "credits.remaining": monthlyLimit,
      "credits.refresh_date": newRefreshDate.toISOString(),
      "credit_history.lastUpdated": now.toISOString(),
    });

    // Log refresh
    await db.collection("credit_logs").add({
      userId,
      action: "credits_refreshed",
      credits_spent: -monthlyLimit,
      credits_before: oldBalance,
      credits_after: monthlyLimit,
      feature: "system",
      timestamp: now.toISOString(),
      description: "Monthly credits refreshed",
      status: "completed",
    });

    return {
      success: true,
      newBalance: monthlyLimit,
      refreshDate: newRefreshDate.toISOString(),
    };
  } catch (error) {
    console.error("Error refreshing credits:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to refresh credits",
    };
  }
}

/**
 * Get user credit usage history
 */
export async function getCreditHistory(userId: string, limit = 20) {
  try {
    const logs = await db
      .collection("credit_logs")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const history = logs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      history,
    };
  } catch (error) {
    console.error("Error getting credit history:", error);
    return {
      success: false,
      history: [],
      error: error instanceof Error ? error.message : "Failed to fetch history",
    };
  }
}

/**
 * Add credits manually (admin only)
 */
export async function addCreditsManual(
  userId: string,
  creditsToAdd: number,
  reason: string
) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data() as any;
    const currentCredits = userData.credits?.available || 0;
    const newBalance = currentCredits + creditsToAdd;
    const now = new Date();

    await db.collection("users").doc(userId).update({
      "credits.available": newBalance,
      "credits.remaining": newBalance,
      "credit_history.lastUpdated": now.toISOString(),
    });

    // Log the manual addition
    await db.collection("credit_logs").add({
      userId,
      action: "credits_manual_add",
      credits_spent: -creditsToAdd,
      credits_before: currentCredits,
      credits_after: newBalance,
      feature: "system",
      timestamp: now.toISOString(),
      description: `Manual credit addition: ${reason}`,
      status: "completed",
    });

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    console.error("Error adding credits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add credits",
    };
  }
}
