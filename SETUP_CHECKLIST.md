# Quick Setup Checklist

## ✅ Implementation Complete

I've successfully integrated Razorpay payment system with premium features. Here's what's been set up:

### 📦 Installed Packages

- `razorpay` - Payment gateway SDK
- `crypto` - For signature verification

### 🔐 Premium Features Locked

- ✅ **Interview Bot** (`/interview`) - Requires premium
- ✅ **Resume Parsing** (`/resume`) - Requires premium

### 💳 Payment Plans

- **Monthly**: ₹299/month (30 days)
- **Yearly**: ₹2,999/year (365 days, 40% savings)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Razorpay Keys

1. Visit https://razorpay.com and sign up
2. Go to Dashboard → Settings → API Keys
3. Copy your **Key ID** and **Key Secret**

### Step 2: Set Environment Variables

Create `.env.local` file in project root:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id_here
```

### Step 3: Install Dependencies

```bash
npm install
```

---

## 📁 New Files Created

### Payment System

- `lib/actions/payment.action.ts` - Server-side payment logic
- `lib/hooks/usePremiumStatus.ts` - React hook for premium status
- `app/api/payment/create-order/route.ts` - Create Razorpay order
- `app/api/payment/verify/route.ts` - Verify payment
- `app/api/payment/subscription/route.ts` - Check subscription status

### UI Components

- `components/PricingPage.tsx` - Beautiful pricing page with Razorpay integration
- `components/FreemiumBanner.tsx` - Banners for non-premium and expiring users
- `app/(root)/pricing/page.tsx` - Pricing page route

### Documentation

- `PAYMENT_INTEGRATION.md` - Complete integration guide
- `.env.example` - Environment variables template

### Updated Files

- `types/index.d.ts` - Added payment types
- `constants/index.ts` - Added pricing plans
- `app/(root)/interview/page.tsx` - Added premium check
- `app/(root)/resume/page.tsx` - Added premium check
- `package.json` - Added Razorpay dependency

---

## 🔌 Integration Points

### 1. Add Link to Navbar

In [NavBarNew.tsx](../../components/NavBarNew.tsx):

```tsx
<Link href="/pricing" className="text-white">
  Go Premium
</Link>
```

### 2. Use Premium Banner on Home

```tsx
import { FreemiumBanner } from "@/components/FreemiumBanner";
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";

<FreemiumBanner isPremium={isPremium} daysRemaining={daysRemaining} />;
```

### 3. Check Premium in Server Components

```tsx
import { checkPremiumAccess } from "@/lib/actions/payment.action";

const canAccess = await checkPremiumAccess(userId);
if (!canAccess) redirect("/pricing");
```

---

## 🧪 Test Payment (Sandbox Mode)

Use these test cards:

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4111 1111 1111 1112`
- Expiry: Any future date
- CVV: Any 3 digits

---

## 📊 Database Schema Updated

Users now have:

```javascript
{
  // ... existing fields
  isPremium: boolean,           // User has active premium
  premiumExpiresAt: string,     // When premium expires (ISO date)
  subscriptionId: string,       // Razorpay order ID
  paymentId: string,            // Razorpay payment ID
}
```

New collection: `subscriptions` with payment history

---

## 🔄 Payment Flow

```
User Clicks "Go Premium"
    ↓
Pricing Page Loads (pricing component)
    ↓
User Selects Plan → Create Order API
    ↓
Razorpay Modal Opens
    ↓
User Completes Payment
    ↓
Verify Payment Signature
    ↓
Create Subscription in Firestore
    ↓
Update User is Premium
    ↓
Redirect to Dashboard ✅
```

---

## 📱 Key Actions

### Check Premium Status

```tsx
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";

const { isPremium, daysRemaining, loading } = usePremiumStatus(userId);
```

### Get Payment History

```tsx
import { getUserPaymentHistory } from "@/lib/actions/payment.action";

const history = await getUserPaymentHistory(userId);
```

### Cancel Subscription

```tsx
import { cancelSubscription } from "@/lib/actions/payment.action";

await cancelSubscription(userId);
```

---

## ⚠️ Important Notes

1. **Env Variables**: Must be set before server starts
2. **Razorpay Script**: Loads automatically from CDN
3. **Security**: All secrets stored server-side only
4. **Testing**: Switch to Live mode in Razorpay dashboard for real payments
5. **Database**: Ensure Firestore permissions allow writes to users & subscriptions collections

---

## 🛠️ Customization

### Change Prices

Edit `constants/index.ts`:

```tsx
PAYMENT_PLANS: {
  MONTHLY: {
    price: 29900,  // in paise (₹299 = 29900)
    displayPrice: "₹299",
    // ...
  }
}
```

### Change Features

Add more fields to pricing cards in `components/PricingPage.tsx`

### Add More Premium Features

1. Add premium check before feature
2. Redirect to `/pricing?feature=feature_name`
3. Update feature list in pricing page

---

## 📚 Detailed Documentation

See **[PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md)** for:

- Complete setup instructions
- API endpoint documentation
- Troubleshooting guide
- Security best practices
- Testing guide

---

## ✨ You're All Set!

The payment system is ready to use. Just:

1. Add Razorpay credentials to .env.local
2. Add pricing link to navbar
3. Test with sandbox credentials
4. Deploy and enable live mode when ready

Questions? Check PAYMENT_INTEGRATION.md 📖
