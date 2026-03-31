# 🎯 API Credits System - Complete Guide

## Overview

A credit-based system that:

- ✅ Automatically allocates credits on purchase
- ✅ Tracks API usage per user
- ✅ Prevents overspending with credit checks
- ✅ Different credit tiers for different plans
- ✅ Automatic refill on subscription renewal

---

## Architecture

```
User Purchases Premium
        ↓
Grant Credits (based on plan)
        ↓
User Uses Feature (Interview, Resume, etc.)
        ↓
Deduct Credits from Balance
        ↓
Track Usage in Database
        ↓
Alert if Low Balance
        ↓
Auto-Refill on Subscription Renewal
```

---

## Credit Allocation Plans

### Monthly Premium (₹299)

- **Interview Bot**: 100 credits/month
  - 1 Interview = 10 credits
  - Total: 10 interviews/month
- **Resume Parser**: 50 credits/month
  - 1 Parse = 5 credits
  - Total: 10 resumes/month
- **AI Analysis**: 20 credits/month

### Yearly Premium (₹2,999)

- **Interview Bot**: 1,200 credits/year
  - 1 Interview = 10 credits
  - Total: 120 interviews/year (10/month)
- **Resume Parser**: 600 credits/year
  - 1 Parse = 5 credits
  - Total: 120 resumes/year (10/month)
- **AI Analysis**: 240 credits/year

---

## Database Schema

### Users Collection (Add Fields)

```javascript
{
  id: "user123",
  // ... existing fields ...
  credits: {
    available: 100,        // Current balance
    used: 20,             // Total used this month
    remaining: 80,        // Available balance
    monthly_limit: 200,   // Monthly cap
    refresh_date: "2025-04-30"  // When credits reset
  },
  credit_history: {
    lastUpdated: "2025-03-30T10:00:00Z",
    refillCount: 1,
    totalSpent: 20
  }
}
```

### Credits Log Collection (NEW)

```javascript
{
  id: "log_xxx",
  userId: "user123",
  action: "interview_started",        // or "resume_parsed", "ai_analyzed"
  credits_spent: 10,
  credits_before: 100,
  credits_after: 90,
  feature: "interview",
  timestamp: "2025-03-30T10:00:00Z",
  description: "Mock Interview - Backend Developer",
  status: "completed"  // or "pending", "failed"
}
```

### Plans Collection (Reference)

```javascript
{
  id: "plan_monthly",
  name: "Monthly Premium",
  credits: {
    interview: 100,
    resume: 50,
    ai_analysis: 20,
    total: 170
  },
  duration_days: 30,
  reset_frequency: "monthly"
}
```

---

## Implementation Files Needed

### 1. Types (Update types/index.d.ts)

```typescript
interface UserCredits {
  available: number;
  used: number;
  remaining: number;
  monthly_limit: number;
  refresh_date: string;
}

interface CreditLog {
  id: string;
  userId: string;
  action: string;
  credits_spent: number;
  credits_before: number;
  credits_after: number;
  feature: string;
  timestamp: string;
  description: string;
  status: "completed" | "pending" | "failed";
}

interface CreditDeductParams {
  userId: string;
  feature: "interview" | "resume" | "chat";
  credits: number;
  description: string;
}
```

### 2. Constants (Update constants/index.ts)

```typescript
export const CREDIT_COSTS = {
  INTERVIEW_START: 10, // Start an interview
  INTERVIEW_MINUTE: 1, // Per minute of interview
  RESUME_PARSE: 5, // Parse one resume
  ATS_SCORE: 3, // ATS score analysis
  JD_MATCH: 3, // Job description match
  AI_CHAT_MESSAGE: 1, // AI chat message
};

export const CREDIT_ALLOCATIONS = {
  MONTHLY: {
    interview: 100,
    resume: 50,
    ai_analysis: 20,
    total: 170,
  },
  YEARLY: {
    interview: 1200,
    resume: 600,
    ai_analysis: 240,
    total: 2040,
  },
};
```

### 3. Server Actions (lib/actions/credits.action.ts)

```typescript
"use server";

import { db } from "@/firebase/admin";
import { CREDIT_COSTS, CREDIT_ALLOCATIONS } from "@/constants";

/**
 * Grant credits when user purchases premium
 */
export async function grantCredits(
  userId: string,
  planType: "monthly" | "yearly"
) {
  try {
    const allocation = CREDIT_ALLOCATIONS[planType.toUpperCase()];
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
      credits_spent: -allocation.total, // Negative = grant
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

    // Check user exists and has credits
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data() as any;
    const currentCredits = userData.credits?.available || 0;

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
    const refreshDate = new Date(credits.refresh_date);
    if (new Date() > refreshDate && credits.monthly_limit > 0) {
      // Auto-refresh
      await refreshCredits(userId);
      return getUserCredits(userId); // Recursive call to get updated data
    }

    return {
      success: true,
      credits,
      daysUntilRefresh: Math.ceil(
        (refreshDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
      ),
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
```

---

## Usage in Features

### Interview Feature

```typescript
// Before starting interview
import { hasEnoughCredits, deductCredits } from "@/lib/actions/credits.action";

export async function startInterview(userId: string) {
  // Check credits
  const hasCredits = await hasEnoughCredits(userId, "interview", 10);
  if (!hasCredits) {
    return {
      success: false,
      message: "Insufficient credits. Upgrade your plan.",
    };
  }

  // ... start interview ...

  // Deduct credits after interview completes
  await deductCredits({
    userId,
    feature: "interview",
    credits: 10,
    description: "Mock Interview - Backend Position",
  });

  return {
    success: true,
    message: "Interview started",
  };
}
```

### Resume Parser Feature

```typescript
// Before parsing resume
const hasCredits = await hasEnoughCredits(userId, "resume", 5);
if (!hasCredits) {
  redirect("/pricing?low-credits=true");
}

// After successful parse
await deductCredits({
  userId,
  feature: "resume",
  credits: 5,
  description: "Resume parsed - ATS Score calculated",
});
```

---

## Dashboard Component

### Show User Credit Balance

```typescript
"use client";

import { useCreditStatus } from "@/lib/hooks/useCreditStatus";
import { AlertCircle, TrendingDown } from "lucide-react";

export function CreditDisplay({ userId }: { userId: string }) {
  const { credits, daysUntilRefresh, loading } = useCreditStatus(userId);

  if (loading) return <div>Loading credits...</div>;

  const percentage = (credits.available / 170) * 100;
  const isLow = credits.available < 20;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Your Credits</h3>
        {isLow && <AlertCircle className="w-5 h-5 text-orange-500" />}
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-2xl font-bold text-purple-600">
            {credits.available}
          </span>
          <span className="text-sm text-gray-600">
            Used: {credits.used} / Remaining: {daysUntilRefresh} days
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isLow ? "bg-orange-500" : "bg-purple-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {isLow && (
        <div className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
          ⚠️ Low on credits! Upgrade to get more.
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Credits refresh in {daysUntilRefresh} days
      </p>
    </div>
  );
}
```

---

## React Hooks

### useCreditStatus (lib/hooks/useCreditStatus.ts)

```typescript
"use client";

import { useEffect, useState } from "react";
import { getUserCredits } from "@/lib/actions/credits.action";

interface CreditStatus {
  credits: {
    available: number;
    used: number;
    remaining: number;
  };
  daysUntilRefresh: number;
  loading: boolean;
  error?: string;
}

export function useCreditStatus(userId?: string): CreditStatus {
  const [status, setStatus] = useState<CreditStatus>({
    credits: { available: 0, used: 0, remaining: 0 },
    daysUntilRefresh: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchCredits = async () => {
      if (!userId) {
        setStatus({
          credits: { available: 0, used: 0, remaining: 0 },
          daysUntilRefresh: 0,
          loading: false,
        });
        return;
      }

      try {
        const result = await getUserCredits(userId);
        if (result.success) {
          setStatus({
            credits: result.credits,
            daysUntilRefresh: result.daysUntilRefresh,
            loading: false,
          });
        } else {
          setStatus((prev) => ({
            ...prev,
            loading: false,
            error: result.error,
          }));
        }
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load credits",
        }));
      }
    };

    fetchCredits();
  }, [userId]);

  return status;
}
```

---

## Integration with Payment System

### When User Purchases Premium (payment.action.ts)

```typescript
// After payment verification succeeds:
import { grantCredits } from "@/lib/actions/credits.action";

export async function verifyPaymentAndCreateSubscription(
  params: VerifyPaymentParams
) {
  // ... existing verification code ...

  // After updating user as premium
  await grantCredits(userId, planType); // ✨ NEW: Grant credits

  return {
    success: true,
    subscription,
    expiresAt: expiresAt.toISOString(),
  };
}
```

---

## API Endpoints

### Check Credits

```bash
GET /api/credits/check?userId=user_id
Response: {
  available: 100,
  used: 20,
  remaining: 80,
  daysUntilRefresh: 20
}
```

### Deduct Credits

```bash
POST /api/credits/deduct
Body: {
  userId: "user123",
  feature: "interview",
  credits: 10,
  description: "Started mock interview"
}
Response: {
  success: true,
  newBalance: 90,
  creditsSpent: 10
}
```

### Get History

```bash
GET /api/credits/history?userId=user_id&limit=20
Response: {
  history: [
    {
      id: "log_1",
      action: "interview",
      credits_spent: 10,
      timestamp: "2025-03-30T10:00:00Z",
      description: "Mock Interview - Backend"
    },
    // ...
  ]
}
```

---

## Frontend Integration Example

### Block Feature if No Credits

```typescript
// In interview/page.tsx
"use client";

import { useCreditStatus } from "@/lib/hooks/useCreditStatus";
import { CREDIT_COSTS } from "@/constants";

export default function InterviewPage({ userId }: { userId: string }) {
  const { credits, loading } = useCreditStatus(userId);

  const canStartInterview = credits.available >= CREDIT_COSTS.INTERVIEW_START;

  if (!canStartInterview) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Not Enough Credits</h2>
        <p className="mb-4">
          You need {CREDIT_COSTS.INTERVIEW_START} credits to start an interview.
          You have {credits.available}.
        </p>
        <Link href="/pricing">
          <Button>Upgrade Plan</Button>
        </Link>
      </div>
    );
  }

  return <InterviewBot userId={userId} />;
}
```

---

## Automatic Refill on Subscription Renewal

Currently, credits are granted manually when payment is verified. To make it automatic on renewal:

1. Set up Razorpay webhooks (optional)
2. Run daily cron job to check for expiring subscriptions
3. Automatically refill credits on the refresh date

```typescript
// Run as a scheduled task
export async function checkAndRefillCredits() {
  const usersSnapshot = await db
    .collection("users")
    .where("isPremium", "==", true)
    .where("credits.refresh_date", "<=", new Date().toISOString())
    .get();

  for (const doc of usersSnapshot.docs) {
    await refreshCredits(doc.id);
  }
}
```

---

## Cost Management Tips

### Per-Tier Pricing

```
Free User: 0 credits monthly
Monthly Premium: 170 credits/month (₹299)
Yearly Premium: 2,040 credits/year (₹2,999)
```

### Dynamic Pricing (Optional)

Adjust credits based on:

- Time of day (off-peak = cheaper)
- API provider costs (OpenAI > Gemini)
- User tier (Enterprise = more credits)

---

## Next Steps

1. ✅ Update types with credit fields
2. ✅ Add credit constants
3. ✅ Create credit actions (lib/actions/credits.action.ts)
4. ✅ Create credit hook (lib/hooks/useCreditStatus.ts)
5. ✅ Update payment system to grant credits
6. ✅ Add credit checks to features
7. ✅ Create credit dashboard
8. ✅ Set up automatic refill (optional)

---

This system provides:

- ✅ Flexible credit allocation
- ✅ Usage tracking
- ✅ Automatic refills
- ✅ Low balance alerts
- ✅ Full audit trail
- ✅ Easy to extend

Let me know if you want me to create the actual code files! 🚀
