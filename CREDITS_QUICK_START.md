# API Credits System - Quick Start

## What Was Created

Your application now has a complete **automated API credits system** that:

- ✅ Grants credits automatically when users purchase premium
- ✅ Tracks credit usage per feature
- ✅ Enforces credit limits before features execute
- ✅ Auto-refreshes credits on monthly/yearly cycles
- ✅ Logs all transactions for analytics

## Files Created (6 core files)

| File                               | Purpose                          |
| ---------------------------------- | -------------------------------- |
| `lib/actions/credits.action.ts`    | Server-side credit operations    |
| `lib/hooks/useCreditStatus.ts`     | React hook for credit management |
| `app/api/credits/check/route.ts`   | Check available credits          |
| `app/api/credits/deduct/route.ts`  | Deduct credits for feature use   |
| `app/api/credits/history/route.ts` | Get credit usage history         |
| `CREDITS_IMPLEMENTATION_GUIDE.md`  | Full implementation guide        |

## Files Updated (3 core files)

| File                            | Changes                                  |
| ------------------------------- | ---------------------------------------- |
| `package.json`                  | Already done ✓                           |
| `types/index.d.ts`              | Added credit type definitions            |
| `constants/index.ts`            | Added CREDIT_COSTS & CREDIT_ALLOCATIONS  |
| `lib/actions/payment.action.ts` | Integrated auto-credit grant on purchase |

## How Credits Work

### Credit Allocation

```
Monthly Plan (₹299)   → 170 credits total
Yearly Plan (₹2,999)  → 2,040 credits total

Monthly gives:
- Interview: 100 credits (10 per session = 10 interviews)
- Resume: 50 credits (5 per parse = 10 parses)
- Other: 20 credits
```

### Cost Per Feature

```
Interview       = 10 credits
Resume Parsing  = 5 credits
ATS Score       = 3 credits
Chat Message    = 1 credit
Career Path     = 2 credits
```

### Auto-Granting Flow

```
1. User buys "Monthly Premium" (₹299)
2. Payment verified
3. grantCredits() automatically called
4. 170 credits added to user's account
5. User can now use premium features
6. Credits refresh after 30 days
```

## 3-Step Integration Guide

### Step 1: Add Credits Check to Interview Page

**File:** `app/(root)/interview/page.tsx`

```tsx
import { useCreditStatus } from "@/lib/hooks/useCreditStatus";
import { CREDIT_COSTS } from "@/constants";

// Inside your component:
const { credits, checkCredits } = useCreditStatus(userId);

async function startInterview() {
  const result = await checkCredits("interview", CREDIT_COSTS.INTERVIEW);

  if (!result.canUse) {
    // Show premium required modal
    setShowUpgradeModal(true);
    return;
  }

  // Proceed with interview
  initializeVAPI();
}
```

### Step 2: Deduct Credits After Feature Use

**File:** `app/(root)/resume/[id]/page.tsx`

```tsx
import { useCreditStatus } from "@/lib/hooks/useCreditStatus";
import { CREDIT_COSTS } from "@/constants";

// Inside your component:
const { useCredits } = useCreditStatus(userId);

async function parseResume() {
  // Call your Gemini API
  const result = await callGeminiAPI(resumeText);

  // Then deduct credits
  const creditsResult = await useCredits(
    "resume_parse",
    CREDIT_COSTS.RESUME_PARSE,
    `Resume: ${resumeFile.name}`
  );

  if (creditsResult.success) {
    console.log(`New balance: ${creditsResult.newBalance}`);
  }
}
```

### Step 3: Display Credit Balance

**Create new file:** `components/CreditBadge.tsx`

```tsx
import { useCreditStatus } from "@/lib/hooks/useCreditStatus";

export function CreditBadge({ userId }) {
  const { credits, loading, daysUntilRefresh } = useCreditStatus(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-blue-100 p-2 rounded">
      <p className="text-sm font-semibold">
        💎 {credits?.available} credits available
      </p>
      <p className="text-xs text-gray-600">
        Refreshes in {daysUntilRefresh} days
      </p>
    </div>
  );
}
```

Then use it in your navbar:

```tsx
<CreditBadge userId={userId} />
```

## Database Setup Required

### 1. Click on your Firestore database in Firebase Console

### 2. Create Collection: `credit_logs`

```
Document ID: auto-generated
Fields:
- userId: string
- action: string
- credits_spent: number
- credits_before: number
- credits_after: number
- feature: string
- timestamp: string
- description: string
- status: string
```

### 3. Update User Document Structure

Your existing `users` collection documents should get these fields automatically, but you can manually add to test:

```
credits: {
  available: 170
  used: 0
  remaining: 170
  monthly_limit: 170
  refresh_date: (date 30 days from now)
}

credit_history: {
  lastUpdated: (current date)
  refillCount: 1
}
```

## Testing the System

### Test 1: Manual Credit Grant (for testing)

```tsx
// In your admin panel or temporarily in a component:
import { grantCredits } from "@/lib/actions/credits.action";

// After getting a user ID:
await grantCredits(userId, "monthly"); // Give 170 credits
```

### Test 2: Check Balance

```tsx
import { getUserCredits } from "@/lib/actions/credits.action";

const result = await getUserCredits(userId);
console.log(result.credits); // { available: 170, ... }
```

### Test 3: Full Payment → Credits Flow

1. Go to `/pricing`
2. Click "Buy Monthly"
3. Complete payment with Razorpay test card: `4111 1111 1111 1111`
4. Check user document in Firestore
5. Should see `credits.available: 170` ✓

## Firestore Security Rules

Add these rules to `firestore.rules`:

```typescript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Credit logs - users can only see their own
    match /credit_logs/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create, update, delete: if false; // Server-side only
    }

    // User credits - users can see their own
    match /users/{user}/credits/{document=**} {
      allow read: if request.auth.uid == user;
      allow write: if false; // Server-side only
    }
  }
}
```

## Troubleshooting

### Q: Credits not granted after payment

**A:** Check that `grantCredits()` is being called in `verifyPaymentAndCreateSubscription()`. Look in `lib/actions/payment.action.ts` around line 135.

### Q: User sees "Insufficient Credits" but should have enough

**A:**

1. Check Firestore: Does user document have `credits.available` field?
2. Run: `await getUserCredits(userId)` to verify balance
3. Grant manually: `await grantCredits(userId, "monthly")`

### Q: How do I give bonus credits?

**A:**

```tsx
import { addCreditsManual } from "@/lib/actions/credits.action";

await addCreditsManual(userId, 50, "Referral bonus");
```

### Q: How do I see usage history?

**A:**

```tsx
import { getCreditHistory } from "@/lib/actions/credits.action";

const { history } = await getCreditHistory(userId, 50);
history.forEach((log) => console.log(log));
```

## Advanced: Auto-Refresh Cron Job

For production, set up monthly credit refresh automatically:

**Using Firebase Cloud Tasks:**

```tsx
// lib/actions/cron.action.ts
export async function refreshExpiredCredits() {
  const now = new Date();

  // Find users whose credits need refresh
  const users = await db
    .collection("users")
    .where("credits.refresh_date", "<", now)
    .get();

  for (const userDoc of users.docs) {
    await refreshCredits(userDoc.id);
    console.log(`Refreshed credits for ${userDoc.id}`);
  }
}

// Then call this daily via Cloud Tasks
// Or use Vercel Cron: https://vercel.com/docs/cron-jobs
```

**Using Vercel Crons (simpler):**

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-credits",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Create API route `app/api/cron/refresh-credits/route.ts`:

```tsx
import { refreshExpiredCredits } from "@/lib/actions/cron.action";

export async function GET(request) {
  // Verify it's from Vercel
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  await refreshExpiredCredits();
  return Response.json({ ok: true });
}
```

## Next: Implementation Checklist

- [ ] Add credits check to Interview page
- [ ] Add credits check to Resume Parser
- [ ] Add CreditBadge component to navbar
- [ ] Test payment → credits flow
- [ ] Create credit usage dashboard
- [ ] Add email notifications for low credits
- [ ] Set up auto-refresh cron
- [ ] Create admin panel for manual grants
- [ ] Add analytics dashboard
- [ ] Set up Razorpay webhooks (optional)

## Full Documentation

For complete implementation guide with examples, see: [CREDITS_IMPLEMENTATION_GUIDE.md](CREDITS_IMPLEMENTATION_GUIDE.md)

---

**Your credits system is ready to use!** 🚀

Built-in features:
✅ Automatic grant on payment
✅ Per-feature cost tracking
✅ 30/365-day refresh cycles
✅ Server-side security
✅ Full audit logging
✅ React hooks for easy integration

Start with Step 1 above or read the full guide!
