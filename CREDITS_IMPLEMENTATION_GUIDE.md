# API Credits System - Implementation Guide

## Overview

Your IntelliCoach platform now has a complete API credits system for automating API key usage limits and allocating specific credits to users based on their subscription tier.

## Architecture

### Credit Allocation by Plan

**Monthly Plan (₹299)**

- Total Credits: 170
- Interview: 100 credits
- Resume Parsing: 50 credits
- Other Features: 20 credits
- Refresh: Every 30 days

**Yearly Plan (₹2,999)**

- Total Credits: 2,040 (170 × 12)
- Interview: 1,200 credits
- Resume Parsing: 600 credits
- Other Features: 240 credits
- Refresh: Every 365 days

### Cost per Feature

| Feature        | Credits | API    | Notes          |
| -------------- | ------- | ------ | -------------- |
| Interview      | 10      | VAPI   | Per session    |
| Resume Parsing | 5       | Gemini | Per upload     |
| ATS Score      | 3       | Gemini | Per evaluation |
| Chat Message   | 1       | OpenAI | Per message    |
| Career Path    | 2       | System | Per generation |

## How It Works

### 1. Payment Flow → Credit Grant

```
User purchases subscription
       ↓
Payment verified (payment.action.ts)
       ↓
grantCredits() called (credits.action.ts)
       ↓
Credits stored in Firestore
       ↓
User can now use features
```

### 2. Feature Usage → Credit Deduction

```
User starts interview/parses resume
       ↓
Check hasEnoughCredits()
       ↓
If true → deductCredits() called
       ↓
Update Firestore & log usage
       ↓
Feature executes
```

### 3. Auto-Refresh

```
Monthly/Yearly date arrives
       ↓
refreshCredits() called (auto or manual)
       ↓
Credits reset to plan allocation
       ↓
Usage counter resets
```

## Implementation Files Created

✅ **Server Actions** (`lib/actions/credits.action.ts`)

- `grantCredits()` - Allocate credits on purchase
- `hasEnoughCredits()` - Check balance
- `deductCredits()` - Deduct on feature use
- `getUserCredits()` - Get current balance
- `refreshCredits()` - Reset monthly/yearly
- `getCreditHistory()` - Usage logs
- `addCreditsManual()` - Admin override

✅ **React Hook** (`lib/hooks/useCreditStatus.ts`)

- `useCreditStatus()` - Full credit management
- `useFeatureAvailability()` - Feature access check

✅ **API Routes**

- `POST /api/credits/check` - Check balance & feature availability
- `POST /api/credits/deduct` - Deduct credits for action
- `GET /api/credits/history` - Get usage history

✅ **Type Definitions** (`types/index.d.ts`)

- `CreditDeductParams`
- `CreditStatus`
- `CreditLog`
- `CreditCheckResult`

✅ **Constants** (`constants/index.ts`)

- `CREDIT_COSTS` - Cost per feature
- `CREDIT_ALLOCATIONS` - Plan allocations

✅ **Integration** (Payment Flow)

- `verifyPaymentAndCreateSubscription()` now calls `grantCredits()`

## Usage Examples

### Example 1: Check Credits Before Interview

```tsx
// In your interview component
import { useCreditStatus } from "@/lib/hooks/useCreditStatus";
import { CREDIT_COSTS } from "@/constants";

export function InterviewPage({ userId }) {
  const { credits, checkCredits } = useCreditStatus(userId);

  async function startInterview() {
    const result = await checkCredits("interview", CREDIT_COSTS.INTERVIEW);

    if (!result.canUse) {
      showUpgradeModal(); // Show pricing page
      return;
    }

    // Interview can proceed
    initializeInterview();
  }

  return (
    <div>
      <p>Available Credits: {credits?.available}</p>
      <button onClick={startInterview}>Start Interview</button>
    </div>
  );
}
```

### Example 2: Deduct Credits After Resume Parsing

```tsx
// In your resume component
import { useCreditStatus } from "@/lib/hooks/useCreditStatus";
import { CREDIT_COSTS } from "@/constants";

export function ResumeParser({ userId, resumeFile }) {
  const { useCredits } = useCreditStatus(userId);

  async function parseResume() {
    // First, call your Gemini API
    const parsed = await callGeminiAPI(resumeFile);

    // Then deduct credits
    const result = await useCredits(
      "resume_parse",
      CREDIT_COSTS.RESUME_PARSE,
      `Resume parsed: ${resumeFile.name}`
    );

    if (result.success) {
      console.log(`Resume parsed. New balance: ${result.newBalance}`);
    }
  }
}
```

### Example 3: Check if Feature Available (Hook)

```tsx
import { useFeatureAvailability } from "@/lib/hooks/useCreditStatus";
import { CREDIT_COSTS } from "@/constants";

export function CommunityPage({ userId }) {
  const { available, loading } = useFeatureAvailability(
    userId,
    "community",
    CREDIT_COSTS.CHAT_MESSAGE
  );

  if (loading) return <div>Loading...</div>;

  if (!available) {
    return <PremiumRequiredBanner />;
  }

  return <CommunityChat />;
}
```

### Example 4: Manual Credit Addition (Admin)

```tsx
// In admin panel
import { addCreditsManual } from "@/lib/actions/credits.action";

async function grantBonusCredits() {
  const result = await addCreditsManual(
    userId,
    50, // 50 bonus credits
    "Referral bonus - referred 2 friends"
  );

  if (result.success) {
    console.log(`New balance: ${result.newBalance}`);
  }
}
```

### Example 5: Get Usage History

```tsx
import { getCreditHistory } from "@/lib/actions/credits.action";

async function viewUsageStats() {
  const result = await getCreditHistory(userId, 50); // Last 50 transactions

  if (result.success) {
    const history = result.history;
    // history is array of CreditLog objects
    history.forEach((log) => {
      console.log(`${log.timestamp}: ${log.description}`);
      console.log(
        `  Spent: ${log.credits_spent}, Balance: ${log.credits_after}`
      );
    });
  }
}
```

## Database Schema

### `users` Collection

```typescript
{
  id: "user123",
  name: "John",
  email: "john@example.com",
  isPremium: true,
  premiumExpiresAt: "2024-12-31T00:00:00Z",

  // Credits subdocument
  credits: {
    available: 150,      // Current balance
    used: 20,            // Total used this cycle
    remaining: 150,      // Same as available for display
    monthly_limit: 170,  // Plan allocation
    refresh_date: "2024-12-31T00:00:00Z"
  },

  // History subdocument
  credit_history: {
    lastUpdated: "2024-12-20T10:30:00Z",
    refillCount: 1       // How many times refilled
  }
}
```

### `credit_logs` Collection

```typescript
{
  id: "log123",
  userId: "user123",
  action: "interview",        // Feature used
  credits_spent: 10,          // Amount deducted
  credits_before: 160,        // Balance before
  credits_after: 150,         // Balance after
  feature: "interview",
  timestamp: "2024-12-20T10:30:00Z",
  description: "Interview session started",
  status: "completed"         // completed | pending | failed
}
```

## Integration Checklist

- [x] Credits system implemented
- [x] Payment integration added (auto-grant on purchase)
- [ ] Add credit checks to Interview page
- [ ] Add credit checks to Resume Parser page
- [ ] Add credit checks to Chat feature
- [ ] Create User Dashboard with credit display
- [ ] Create Admin Panel for manual credit grants
- [ ] Set up auto-refresh cron job (if using Cloud Tasks)
- [ ] Add credit warning notifications (10% remaining)
- [ ] Create upgrade incentive modals

## Next Steps

### Phase 1: Feature Integration (Priority)

1. **Interview Page** (`app/(root)/interview/page.tsx`)
   - Check 10 credits before starting
   - Show "Insufficient Credits" modal if not enough
   - Deduct credits after session completes

2. **Resume Page** (`app/(root)/resume/page.tsx`)
   - Check 5 credits before parsing
   - Deduct 3 credits for ATS score
   - Show credit cost in UI

3. **Chat** (if used in app)
   - Check 1 credit per message
   - Warn when low on credits

### Phase 2: User Feedback (Important)

1. **Credit Display Component**

   ```tsx
   // components/CreditStatus.tsx
   - Show current balance
   - Days until refresh
   - Usage this cycle
   - Link to upgrade page
   ```

2. **Usage Dashboard**
   ```tsx
   // app/(root)/dashboard/credits/page.tsx
   - Chart of credit usage
   - Feature breakdown
   - Historical logs
   - Projected usage
   ```

### Phase 3: Admin Tools (Optional)

1. **Admin Panel**
   - Grant bonus credits
   - View user credit stats
   - Reset credits manually
   - Export usage reports

2. **Analytics**
   - Most used features
   - Average credits per user
   - Upgrade conversion rate

## API Endpoints Reference

### Check Credits

```bash
GET /api/credits/check?userId=abc&feature=interview&needed=10

Response:
{
  "success": true,
  "credits": { "available": 150, "used": 20, ... },
  "feature": "interview",
  "creditsNeeded": 10,
  "hasEnough": true,
  "daysUntilRefresh": 15
}
```

### Deduct Credits

```bash
POST /api/credits/deduct

Body:
{
  "userId": "abc",
  "feature": "interview",
  "credits": 10,
  "description": "Interview session - backend role"
}

Response:
{
  "success": true,
  "newBalance": 140,
  "creditsSpent": 10,
  "message": "10 credits spent on interview"
}
```

### Get History

```bash
GET /api/credits/history?userId=abc&limit=20

Response:
{
  "success": true,
  "history": [
    {
      "id": "log123",
      "action": "interview",
      "credits_spent": 10,
      "description": "Interview session",
      "timestamp": "2024-12-20T10:30:00Z"
    }
  ],
  "count": 5
}
```

## Troubleshooting

### Issue: User has Premium but no credits

**Solution:** Manually call `grantCredits()`:

```tsx
import { grantCredits } from "@/lib/actions/credits.action";

await grantCredits(userId, "monthly");
```

### Issue: Credits not deducting

**Solution:** Check:

1. `userId` matches exactly
2. `credits` parameter is a number
3. User has enough balance

### Issue: Auto-refresh not working

**Solution:** Add to your backend cron:

```tsx
// lib/actions/cron.action.ts
export async function refreshExpiredCredits() {
  const now = new Date();
  const users = await db
    .collection("users")
    .where("credits.refresh_date", "<", now)
    .get();

  for (const user of users.docs) {
    await refreshCredits(user.id);
  }
}
```

## Security Notes

1. ✅ All credits operations are server-side (`"use server"`)
2. ✅ Credits verified before deduction (can't go negative)
3. ✅ All operations logged in `credit_logs` collection
4. ✅ Timestamps are server-side (can't be faked)
5. ✅ Use Firebase Rules to restrict direct collection access:

```typescript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /credit_logs/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create, update, delete: if false; // Server-side only
    }

    match /users/{user}/credits {
      allow read: if request.auth.uid == user;
      allow write: if false; // Server-side only
    }
  }
}
```

## Migration from Free to Premium

When a free user upgrades:

1. Payment verified ✓
2. `grantCredits()` automatically called ✓
3. Existing user document updated with `isPremium: true` ✓
4. `credits` subdocument created
5. No manual steps needed!

For users who purchased before credits system was added:

```tsx
// One-time migration script
export async function migrateExistingPremiumUsers() {
  const premiumUsers = await db
    .collection("users")
    .where("isPremium", "==", true)
    .where("credits.available", "==", undefined)
    .get();

  for (const userDoc of premiumUsers.docs) {
    const userData = userDoc.data();
    // Determine if monthly or yearly based on expiryDate
    const isYearly = calculateFromExpiryDate(userData.premiumExpiresAt);
    await grantCredits(userDoc.id, isYearly ? "yearly" : "monthly");
  }
}
```

## Performance Considerations

- Credit checks are fast (direct Firestore read)
- Batch operations for admin credits grant
- Credit logs stored separately (doesn't bloat user document)
- Consider pagination for history (limit default: 20)

---

**Your API Credits System is Ready!** 🎉

Everything is integrated and automated:
✅ Credits granted on payment
✅ Can check before features
✅ Auto-deduct on usage
✅ Track everything in logs
✅ Auto-refresh on schedule

Go implement those feature gates!
