# Razorpay Payment Integration Guide

This document explains how to integrate and use the Razorpay payment system in your IntelliCoach application.

## Overview

The payment system enables:

- Monthly and yearly subscription plans
- Premium features: Interview Bot & Resume Parsing
- User subscription management
- Automatic expiration tracking

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up for a **Razorpay** account at https://razorpay.com
2. Go to **Dashboard** → **Settings** → **API Keys**
3. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id_here
```

### 3. Install Dependencies

```bash
npm install razorpay
```

### 4. Update Firebase

Add these fields to your user document schema:

```javascript
{
  // ... existing fields
  isPremium: boolean,           // Whether user has active premium
  premiumExpiresAt: string,     // ISO date when premium expires
  subscriptionId: string,       // Razorpay order ID
  paymentId: string,            // Razorpay payment ID
}
```

## Payment Plans

The system includes two plans:

### Monthly: ₹299/month

- 30 days access
- All premium features

### Yearly: ₹2,999/year

- 365 days access (40% savings)
- All premium features

Plans are defined in `constants/index.ts` - easily modify prices and features there.

## File Structure

```
lib/
  actions/
    payment.action.ts         # Server-side payment logic
  hooks/
    usePremiumStatus.ts       # Hook to check premium status

app/
  api/
    payment/
      create-order/route.ts   # Create Razorpay order
      verify/route.ts         # Verify payment signature
      subscription/route.ts   # Check subscription status
  (root)/
    pricing/page.tsx          # Pricing page

components/
  PricingPage.tsx             # Payment UI component
  FreemiumBanner.tsx          # Promoter banner for non-premium users
```

## Usage

### 1. Add Payment Link to Navbar

In [NavBarNew.tsx](NavBarNew.tsx), add a link:

```tsx
<Link href="/pricing" className="btn btn-primary">
  Go Premium
</Link>
```

### 2. Check User Premium Status

```tsx
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";

export default function MyComponent() {
  const { isPremium, daysRemaining, loading } = usePremiumStatus(userId);

  if (loading) return <div>Loading...</div>;

  if (!isPremium) {
    return <div>Please upgrade to access this feature</div>;
  }

  return <div>Premium content</div>;
}
```

### 3. Show Premium Banner

```tsx
import {
  FreemiumBanner,
  PremiumExpiringBanner,
} from "@/components/FreemiumBanner";
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";

export default function HomePage() {
  const { isPremium, daysRemaining } = usePremiumStatus(userId);

  return (
    <>
      <FreemiumBanner isPremium={isPremium} />
      <PremiumExpiringBanner daysRemaining={daysRemaining} />
      {/* Rest of page */}
    </>
  );
}
```

### 4. Server-Side Premium Check

```tsx
import { checkPremiumAccess } from "@/lib/actions/payment.action";

export default async function ProtectedPage() {
  const user = await getCurrentUser();

  const hasPremium = await checkPremiumAccess(user.id);
  if (!hasPremium) {
    redirect("/pricing");
  }

  return <div>Premium only content</div>;
}
```

## Payment Flow

```
1. User clicks "Subscribe" button
   ↓
2. Create Razorpay order (POST /api/payment/create-order)
   ↓
3. Razorpay checkout opens
   ↓
4. User completes payment
   ↓
5. Verify payment signature (POST /api/payment/verify)
   ↓
6. Create subscription in Firestore
   ↓
7. Update user isPremium = true
   ↓
8. Redirect to dashboard
```

## Security

✅ All API keys are secure (server-side only)
✅ Payment signatures verified with secret key
✅ Premium status checked server-side
✅ Automatic expiration handling
✅ HTTPS only (production)

## Testing

### Test Cards (Razorpay Test Mode)

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4111 1111 1111 1112`
- Any future date for expiry
- Any 3-digit CVV

[More test cards →](https://razorpay.com/docs/payment-gateway/test-cards/)

## Features Locked Behind Premium

Currently locked:

- ✅ Interview Bot (`/interview`)
- ✅ Resume Parsing (`/resume`)

To add more:

1. Add premium check in the page component
2. Redirect to `/pricing?feature=feature_name` if not premium
3. Update pricing page feature list

## Troubleshooting

### Payment not verifying

- Check Razorpay secret key is correct
- Verify signature calculation logic
- Check webhook signature header

### User not showing as premium after payment

- Check Firestore permissions
- Verify userId matches
- Check timestamp in database

### Missing Razorpay script

- Script loads automatically from CDN
- Check browser console for errors
- Clear cache if issues persist

## API Endpoints

### Create Order

```
POST /api/payment/create-order
Body: {
  userId: string,
  planType: "monthly" | "yearly",
  email: string,
  name: string
}
Response: { success: true, order, keyId }
```

### Verify Payment

```
POST /api/payment/verify
Body: {
  orderId: string,
  paymentId: string,
  signature: string,
  userId: string
}
Response: { success: true, subscription, expiresAt }
```

### Check Subscription

```
GET /api/payment/subscription?userId=<userId>
Response: {
  success: true,
  isPremium: boolean,
  premiumExpiresAt?: string,
  daysRemaining?: number
}
```

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)

## Support

For issues:

1. Check Razorpay dashboard for payment status
2. Review Firestore database for subscription data
3. Check server logs for errors
4. Verify environment variables are set
