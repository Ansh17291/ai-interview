# 🏗️ Payment System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER CLIENT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  PricingPage Component (Client-Side)                  │   │
│  │                                                        │   │
│  │  • Display plans (Monthly/Yearly)                     │   │
│  │  • Handle "Subscribe Now" clicks                      │   │
│  │  • Load Razorpay script dynamically                   │   │
│  │  • Open payment modal on click                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                           ↓                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  /pricing Page Route (Server-Side)                    │   │
│  │                                                        │   │
│  │  • Get current user                                   │   │
│  │  • Check auth status                                  │   │
│  │  • Render PricingPage component                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓↑
                        (API Calls)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/payment/create-order                         │  │
│  │ • Receive: userId, planType, email, name              │  │
│  │ • Validate input                                       │  │
│  │ • Call createRazorpayOrder()                           │  │
│  │ • Return: order ID + Razorpay public key              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Payment Gateway (Razorpay)                             │  │
│  │ • Process payment                                      │  │
│  │ • Return: paymentId, signature                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/payment/verify                               │  │
│  │ • Receive: orderId, paymentId, signature, userId       │  │
│  │ • Verify signature with HMAC-SHA256                    │  │
│  │ • Call verifyPaymentAndCreateSubscription()            │  │
│  │ • Return: subscription details + expiration date       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ GET /api/payment/subscription                          │  │
│  │ • Query user premium status                            │  │
│  │ • Check expiration date                                │  │
│  │ • Return: isPremium, daysRemaining                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓↑
              (Server Actions / Database Calls)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                 PAYMENT ACTIONS (Server-Side)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  lib/actions/payment.action.ts                                 │
│                                                                 │
│  • createRazorpayOrder()                                        │
│    └─ Connect to Razorpay SDK                                   │
│    └─ Create order with amount/plan                            │
│                                                                 │
│  • verifyPaymentAndCreateSubscription()                         │
│    └─ Verify HMAC signature                                     │
│    └─ Fetch payment from Razorpay                              │
│    └─ Save subscription to Firestore                           │
│    └─ Update user premium status                               │
│                                                                 │
│  • getUserSubscription()                                        │
│    └─ Query user Firestore doc                                 │
│    └─ Check premium + expiration                               │
│                                                                 │
│  • checkPremiumAccess()                                         │
│    └─ Simple boolean check                                     │
│                                                                 │
│  • getUserPaymentHistory()                                      │
│    └─ Query subscriptions collection                           │
│                                                                 │
│  • cancelSubscription()                                         │
│    └─ Revoke premium status                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓↑
                     (Firestore Calls)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE FIRESTORE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────┐                       │
│  │ users/{userId}                      │                       │
│  ├─────────────────────────────────────┤                       │
│  │ • name: string                      │                       │
│  │ • email: string                     │                       │
│  │ • role: "user" | "mentor"           │                       │
│  │ • isPremium: boolean                │  ← PREMIUM FIELDS     │
│  │ • premiumExpiresAt: string (ISO)    │                       │
│  │ • subscriptionId: string            │                       │
│  │ • paymentId: string                 │                       │
│  └─────────────────────────────────────┘                       │
│                                                                 │
│  ┌─────────────────────────────────────┐                       │
│  │ subscriptions/{docId}               │                       │
│  ├─────────────────────────────────────┤                       │
│  │ • userId: string                    │                       │
│  │ • orderId: string                   │                       │
│  │ • paymentId: string                 │                       │
│  │ • planType: "monthly" | "yearly"    │                       │
│  │ • amount: number                    │                       │
│  │ • status: "success" | "failed"      │                       │
│  │ • startDate: string (ISO)           │                       │
│  │ • endDate: string (ISO)             │                       │
│  │ • createdAt: string (ISO)           │                       │
│  └─────────────────────────────────────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Gating Flow

```
User tries to access /interview or /resume
       ↓
───────┴───────────────────────────────────
│                                         │
✅ User Logged In?                        ❌ Not Logged In
│                                         │
├─ Yes                                    └─ Redirect to /sign-in
│  ↓
│  Check Premium Status
│  ├─ Call getUserSubscription(id)
│  ├─ Check isPremium = true
│  ├─ Check expiration date not passed
│  │
│  ├─ Has Premium & Not Expired? ─────── ❌ Redirect to /pricing?feature=X
│  │  └─ Yes
│  │   ↓
│  │   ✅ Show Protected Content
│  │      (Interview Bot or Resume Parser)
│  │
│  └─ Expired?
│     └─ Update isPremium = false
│     └─ Redirect to /pricing?feature=X
```

## Payment Verification Process

```
Client sends payment info to verify endpoint:
{
  orderId: "order_abc123",
  paymentId: "pay_def456",
  signature: "hmac_hex_string",
  userId: "user_xyz"
}
     ↓
     ├─ Verify signature with HMAC-SHA256
     │  ├─ Body = orderId | paymentId
     │  ├─ Calculate HMAC = HMAC-SHA256(body, KEY_SECRET)
     │  ├─ Compare with provided signature
     │  │
     │  ├─ ✅ Match? Continue ► ❌ No Match? Return error
     │
     ├─ Fetch payment from Razorpay
     │  ├─ Verify status = "captured"
     │  ├─ Match amount with plan
     │  │
     │  ├─ ✅ Valid? Continue ► ❌ Invalid? Return error
     │
     ├─ Create subscription document
     │  ├─ Calculate expiration = now + plan_validity_days
     │  ├─ Insert to subscriptions collection
     │
     ├─ Update user document
     │  ├─ Set isPremium = true
     │  ├─ Set premiumExpiresAt = expiration_date
     │  ├─ Set subscriptionId = orderId
     │  ├─ Set paymentId = paymentId
     │
     └─ Return success response
        └─ Redirect to dashboard
```

## Usage Within App

```
┌─────────────────────────────────┐
│  Component needs premium check  │
├─────────────────────────────────┤
│                                 │
│  Option 1: Server Component     │
│  ─────────────────────────────  │
│  async function Page() {        │
│    const isPremium =            │
│      await checkPremiumAccess()  │
│    if (!isPremium)              │
│      redirect('/pricing')       │
│    return <Premium />           │
│  }                              │
│                                 │
│  Option 2: Client Component     │
│  ─────────────────────────────  │
│  export function Comp() {       │
│    const { isPremium } =        │
│      usePremiumStatus(userId)   │
│    if (!isPremium)              │
│      return <Upgrade />         │
│    return <Premium />           │
│  }                              │
│                                 │
│  Option 3: UI with Banner       │
│  ─────────────────────────────  │
│  export function Page() {       │
│    const { isPremium } =        │
│      usePremiumStatus()         │
│    return (                     │
│      <>                         │
│        <FreemiumBanner          │
│          isPremium={isPremium}  │
│        />                       │
│        <Content />              │
│      </>                        │
│    )                            │
│  }                              │
│                                 │
└─────────────────────────────────┘
```

## Environment Variables

```
.env.local
├─ RAZORPAY_KEY_ID
│  └─ Server-side key (secret, NEVER send to client)
│
├─ RAZORPAY_KEY_SECRET
│  └─ Used to verify signatures (NEVER send to client)
│
└─ NEXT_PUBLIC_RAZORPAY_KEY_ID
   └─ Public key for Razorpay SDK (safe to send)
```

## Data Flow Summary

```
Client                  API Routes              Razorpay          Firestore
  │                        │                       │                 │
  ├─ Click Subscribe ──→   │                       │                 │
  │                        ├─ Create Order ────→  │                 │
  │                        │ ←───── Order ────────│                 │
  │ ←── Order Returned ────┤                       │                 │
  │                        │                       │                 │
  ├─ Open Razorpay ──────────────────────────────→│                 │
  │                        │                       │                 │
  ├─ Complete Payment ──────────────────────────→ │                 │
  │                        │ ← Payment Result ─────│                 │
  │                        │                       │                 │
  ├─ Verify Payment ──→    │                       │                 │
  │                        ├─ Fetch Payment ─────→│                 │
  │                        │ ←─ Confirm ──────────│                 │
  │                        │                       │                 │
  │                        ├─ Create Subscription ────────────────→  │
  │                        │                       │  ←─ Confirm ─┐  │
  │                        │                       │              │  │
  │                        ├─ Update User ───────────────────────→  │
  │                        │                       │                 │
  │ ←── Success ───────────┤                       │                 │
  │                        │                       │                 │
```

## Security Flow

```
Payment Verification Security Chain:

1. Client sends payment data
   ↓
2. API Route receives data
   ↓
3. Reconstruct body: "orderId|paymentId"
   ↓
4. Calculate HMAC-SHA256:
   signature_calculated = HMAC-SHA256(body, KEY_SECRET)
   ↓
5. Compare signatures:
   signature_sent == signature_calculated ?
   ├─ YES → Continue to verify ✅
   └─ NO → Reject payment ❌
   ↓
6. Fetch from Razorpay to triple-check
   ↓
7. Update database only if all checks pass
   ↓
8. Return success/error to client

Key Points:
✅ KEY_SECRET never sent to client
✅ Signature verified before any DB changes
✅ Razorpay API used to triple-check
✅ Only database updated after all verifications
```

This architecture ensures:

- ✅ Secure payment processing
- ✅ No unauthorized premium access
- ✅ Automatic expiration tracking
- ✅ Complete payment audit trail
- ✅ Easy to extend with more premium features
