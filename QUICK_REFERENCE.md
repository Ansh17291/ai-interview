# 🔧 Developer Quick Reference

## Installation & Setup

```bash
# Install dependencies (after updating package.json)
npm install

# Create .env.local with your Razorpay keys
# (See .env.example for template)

# Run development server
npm run dev

# Your app will be at http://localhost:3000
```

---

## Testing Payment Flow

### 1. Navigate to Pricing Page

```
http://localhost:3000/pricing
```

### 2. Test with Sandbox Cards

| Scenario  | Card Number         | Result              |
| --------- | ------------------- | ------------------- |
| Success   | 4111 1111 1111 1111 | ✅ Payment succeeds |
| Failure   | 4111 1111 1111 1112 | ❌ Payment fails    |
| 3D Secure | 5555 5555 5555 4444 | 🔐 3D Secure prompt |

- **Expiry**: MM/YY format, any future date
- **CVV**: Any 3 digits
- **Name**: Any name

---

## Common Tasks

### Check if User has Premium Access

```typescript
// Server-side (in async function)
import { checkPremiumAccess } from "@/lib/actions/payment.action";

const canAccess = await checkPremiumAccess(userId);
if (!canAccess) {
  redirect("/pricing?feature=myfeature");
}
```

### Get User Premium Status (Client-Side)

```typescript
// In React component
"use client";
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";

export default function MyComponent() {
  const { isPremium, daysRemaining, loading } = usePremiumStatus(userId);

  if (loading) return <div>Loading...</div>;

  return isPremium ? (
    <div>Premium: {daysRemaining} days left</div>
  ) : (
    <div>Not premium</div>
  );
}
```

### Add Premium Gate to Page

```typescript
// Server Component
import { redirect } from "next/navigation";
import { checkPremiumAccess } from "@/lib/actions/payment.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function ProtectedPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  if (!await checkPremiumAccess(user.id)) {
    redirect("/pricing?feature=interview");
  }

  return <div>This content is premium only</div>;
}
```

### Get User Payment History

```typescript
import { getUserPaymentHistory } from "@/lib/actions/payment.action";

const { history } = await getUserPaymentHistory(userId);

history.forEach((payment) => {
  console.log(`
    Plan: ${payment.planType}
    Amount: ₹${payment.amount / 100}
    Expires: ${payment.endDate}
  `);
});
```

### Cancel User Subscription

```typescript
import { cancelSubscription } from "@/lib/actions/payment.action";

const result = await cancelSubscription(userId);
if (result.success) {
  console.log("Subscription cancelled");
}
```

---

## API Endpoints

### Create Payment Order

```bash
POST /api/payment/create-order
Content-Type: application/json

{
  "userId": "user_id_string",
  "planType": "monthly",    // or "yearly"
  "email": "user@example.com",
  "name": "User Name"
}
```

**Response:**

```json
{
  "success": true,
  "order": {
    "id": "order_abc123",
    "amount": 29900,
    "currency": "INR"
  },
  "keyId": "rzp_test_xxxxx"
}
```

### Verify Payment

```bash
POST /api/payment/verify
Content-Type: application/json

{
  "orderId": "order_abc123",
  "paymentId": "pay_def456",
  "signature": "hmac_hex_string",
  "userId": "user_id_string"
}
```

**Response:**

```json
{
  "success": true,
  "subscription": {
    "userId": "user_id",
    "planType": "monthly",
    "status": "success",
    "startDate": "2025-03-30T10:00:00Z",
    "endDate": "2025-04-30T10:00:00Z"
  },
  "expiresAt": "2025-04-30T10:00:00Z"
}
```

### Check Subscription Status

```bash
GET /api/payment/subscription?userId=user_id_string
```

**Response:**

```json
{
  "success": true,
  "isPremium": true,
  "premiumExpiresAt": "2025-04-30T10:00:00Z",
  "daysRemaining": 30
}
```

---

## Database Queries

### Check User Premium Status

```sql
-- Firestore Query Equivalent:
SELECT isPremium, premiumExpiresAt
FROM users
WHERE id = "user_id"
```

### Get All Payments for a User

```sql
-- Firestore Query Equivalent:
SELECT * FROM subscriptions
WHERE userId = "user_id"
ORDER BY createdAt DESC
```

### Find Recently Expired Subscriptions

```javascript
// In JavaScript
const db = getFirestore();
const q = query(
  collection(db, "subscriptions"),
  where("status", "==", "success"),
  where("endDate", "<", new Date().toISOString()),
  orderBy("endDate", "desc"),
  limit(10)
);
const results = await getDocs(q);
```

---

## Debugging

### Enable Debug Logging

Add to `.env.local`:

```env
DEBUG=*
```

### Check Payment Status in Razorpay Dashboard

1. Go to https://dashboard.razorpay.com
2. Navigate to **Payments** section
3. Search by Order ID or Payment ID
4. View payment details and status

### Check Firestore Data

1. Go to Firebase Console
2. Select your project
3. Go to Firestore Database
4. Browse collections:
   - **users** - User premium status
   - **subscriptions** - Payment history

### Common Error Messages

| Error                       | Cause                   | Fix                        |
| --------------------------- | ----------------------- | -------------------------- |
| "Invalid plan type"         | Wrong planType value    | Use "monthly" or "yearly"  |
| "Invalid payment signature" | Secret key mismatch     | Check RAZORPAY_KEY_SECRET  |
| "Missing required fields"   | Missing data in request | Verify all required fields |
| "Payment not successful"    | Payment not captured    | Check Razorpay dashboard   |
| "User not found"            | Invalid userId          | Use correct user ID        |

---

## Component Props Reference

### PricingPage Props

```typescript
interface PricingPageProps {
  userId: string; // Current user ID
  userEmail: string; // Current user email
  userName: string; // Current user name
}
```

### FreemiumBanner Props

```typescript
interface FreemiumBannerProps {
  isPremium: boolean; // Whether user is premium
  daysRemaining?: number; // Optional days until expiration
}
```

### usePremiumStatus Hook Returns

```typescript
interface PremiumStatus {
  isPremium: boolean; // Whether user has active premium
  premiumExpiresAt?: string; // ISO date of expiration
  daysRemaining: number; // Days until expiration (0 if not premium)
  loading: boolean; // Whether still loading
  error?: string; // Error message if any
}
```

---

## Configuration

### Change Monthly Price

**File**: `constants/index.ts`

```typescript
export const PAYMENT_PLANS = {
  MONTHLY: {
    price: 99900, // ₹999 (amount in paise)
    displayPrice: "₹999", // What to show users
    // ... rest of config
  },
};
```

### Change Yearly Price

**File**: `constants/index.ts`

```typescript
export const PAYMENT_PLANS = {
  YEARLY: {
    price: 8999900, // ₹89,999 (amount in paise)
    displayPrice: "₹89,999",
    // ... rest of config
  },
};
```

### Change Plan Features

**File**: `constants/index.ts`

```typescript
export const PAYMENT_PLANS = {
  MONTHLY: {
    features: [
      "Unlimited Interview Practice",
      "Resume Parsing & ATS Score",
      // Add more features here
    ],
  },
};
```

### Change Plan Validity

**File**: `constants/index.ts`

```typescript
export const PAYMENT_PLANS = {
  MONTHLY: {
    validityDays: 30, // Change this number
  },
  YEARLY: {
    validityDays: 365, // Change this number
  },
};
```

---

## Useful File Paths

```
Core Payment Logic
├── lib/actions/payment.action.ts         ⭐ All payment functions
├── lib/hooks/usePremiumStatus.ts         ⭐ React hook for premium checks

API Endpoints
├── app/api/payment/create-order/route.ts
├── app/api/payment/verify/route.ts
└── app/api/payment/subscription/route.ts

UI Components
├── components/PricingPage.tsx            ⭐ Main payment UI
├── components/FreemiumBanner.tsx         ⭐ Promotion banners
└── app/(root)/pricing/page.tsx           ⭐ Pricing page route

Configuration
├── constants/index.ts                    ⭐ Pricing plans
├── types/index.d.ts                      ⭐ Type definitions
└── .env.example                          ⭐ Environment template

Protected Routes
├── app/(root)/interview/page.tsx         ⭐ Added premium check
└── app/(root)/resume/page.tsx            ⭐ Added premium check

Documentation
├── SETUP_CHECKLIST.md                    ⭐ Quick start
├── PAYMENT_INTEGRATION.md                ⭐ Technical guide
├── IMPLEMENTATION_EXAMPLES.md            ⭐ Code samples
├── ARCHITECTURE.md                       ⭐ System design
└── PROJECT_SUMMARY.md                    ⭐ Full overview
```

---

## Deployment Checklist

- [ ] Set `RAZORPAY_KEY_ID` in production environment
- [ ] Set `RAZORPAY_KEY_SECRET` in production environment
- [ ] Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` in production
- [ ] Switch Razorpay to Live mode
- [ ] Update live keys in environment
- [ ] Test payment flow with real card
- [ ] Monitor Razorpay dashboard for issues
- [ ] Set up Razorpay webhook alerts (optional)
- [ ] Configure Firebase Firestore security rules
- [ ] Enable HTTPS (automatic on Vercel)

---

## Performance Tips

1. **Cache Premium Status**

   ```tsx
   // Don't call on every render
   const { isPremium } = usePremiumStatus(userId);
   ```

2. **Use Server Components When Possible**

   ```tsx
   // Server-side checks are faster
   const canAccess = await checkPremiumAccess(userId);
   ```

3. **Lazy Load Razorpay Script**
   ```tsx
   // Only loads when user clicks subscribe
   // Already implemented in PricingPage
   ```

---

## Security Checklist

- ✅ `RAZORPAY_KEY_SECRET` never exposed to client
- ✅ Signatures verified on server before DB updates
- ✅ HTTPS enforced in production
- ✅ Firestore rules prevent unauthorized access
- ✅ Premium checks on server routes
- ✅ Session cookies httpOnly
- ✅ Database queries filtered by userId

---

## Need Help?

1. **Quick Start** → Read `SETUP_CHECKLIST.md`
2. **Technical Details** → Read `PAYMENT_INTEGRATION.md`
3. **Code Examples** → Read `IMPLEMENTATION_EXAMPLES.md`
4. **System Design** → Read `ARCHITECTURE.md`
5. **Full Overview** → Read `PROJECT_SUMMARY.md`

---

## Key Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Run production build
npm run lint                   # Check for lint errors

# Testing
npm test                       # Run tests
npm run test:watch           # Watch mode testing

# Deployment (Vercel)
vercel                        # Deploy to Vercel
vercel --prod                 # Deploy to production
```

---

Last Updated: March 2025
Payment System Version: 1.0
