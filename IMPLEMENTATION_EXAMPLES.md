"use client";

/\*\*

- Example implementation of Premium Features in your app
- Copy and adapt these patterns to your existing components
  \*/

// ============================================================================
// 1. ADD TO NAVBAR (NavBarNew.tsx)
// ============================================================================

import Link from "next/link";

export function NavbarExample() {
return (
<nav>
{/_ ... existing nav items ... _/}
<Link href="/pricing" className="btn btn-primary">
🚀 Go Premium
</Link>
</nav>
);
}

// ============================================================================
// 2. HOME PAGE WITH PREMIUM BANNER (app/(root)/page.tsx)
// ============================================================================

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserSubscription } from "@/lib/actions/payment.action";
import { FreemiumBanner, PremiumExpiringBanner } from "@/components/FreemiumBanner";

export async function HomePageExample() {
const user = await getCurrentUser();

// Check subscription status
let premiumStatus = {
isPremium: false,
daysRemaining: 0,
};

if (user?.id) {
const result = await getUserSubscription(user.id);
premiumStatus = {
isPremium: result.isPremium || false,
daysRemaining: result.daysRemaining || 0,
};
}

return (
<>
{/_ Show upgrade banner if not premium _/}
<FreemiumBanner isPremium={premiumStatus.isPremium} />

      {/* Show expiring soon banner if premium is about to expire */}
      <PremiumExpiringBanner daysRemaining={premiumStatus.daysRemaining} />

      {/* Rest of home page */}
      <div>Welcome to IntelliCoach!</div>
    </>

);
}

// ============================================================================
// 3. PREMIUM FEATURE CARD WITH LOGIN/UPGRADE CTA
// ============================================================================

import { Button } from "@/components/ui/button";

interface FeatureCardProps {
title: string;
description: string;
isPremium?: boolean;
onAccess?: () => void;
}

export function PremiumFeatureCard({
title,
description,
isPremium,
onAccess,
}: FeatureCardProps) {
return (
<div className="bg-white rounded-lg shadow p-6 relative">
{!isPremium && (
<div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
<div className="text-center">
<h3 className="text-white font-semibold mb-2">Premium Feature</h3>
<Link href="/pricing">
<Button className="bg-blue-600 hover:bg-blue-700">
Upgrade Now
</Button>
</Link>
</div>
</div>
)}

      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>

      {isPremium && onAccess && (
        <Button onClick={onAccess} className="mt-4">
          Access Feature
        </Button>
      )}
    </div>

);
}

// ============================================================================
// 4. CLIENT COMPONENT WITH PREMIUM STATUS HOOK
// ============================================================================

"use client";

import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";

export function DashboardWithPremiumFeatures() {
const [userId, setUserId] = useState<string | null>(null);
const { isPremium, daysRemaining, loading } = usePremiumStatus(userId || undefined);

useEffect(() => {
getCurrentUser().then((user) => {
if (user?.id) {
setUserId(user.id);
}
});
}, []);

if (loading) {
return <div>Loading premium status...</div>;
}

return (
<div>
{isPremium && (
<div className="bg-green-50 p-4 rounded-lg mb-4">
✅ Premium Active
{daysRemaining > 0 && (
<p className="text-sm text-gray-600">
Expires in {daysRemaining} days
</p>
)}
</div>
)}

      {!isPremium && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">Upgrade to Premium</p>
          <Link href="/pricing">
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Plans
            </Button>
          </Link>
        </div>
      )}

      {/* Premium features here */}
      {isPremium && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold">Premium Features Unlocked</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li>✓ Unlimited Interview Practice</li>
            <li>✓ Resume Parsing & ATS Score</li>
            <li>✓ Career Path Recommendations</li>
          </ul>
        </div>
      )}
    </div>

);
}

// ============================================================================
// 5. PROTECTED PAGE PATTERN (Server Component)
// ============================================================================

import { redirect } from "next/navigation";

export async function ProtectedPageExample() {
const user = await getCurrentUser();

if (!user?.id) {
redirect("/sign-in");
}

const subscriptionStatus = await getUserSubscription(user.id);

if (!subscriptionStatus.isPremium) {
redirect("/pricing?feature=interview");
}

// User is authenticated and premium - show protected content
return (
<div>
<h1>Premium Content</h1>
{/_ Protected content here _/}
</div>
);
}

// ============================================================================
// 6. UPGRADE POPUP / MODAL
// ============================================================================

import { X } from "lucide-react";
import { useState } from "react";

interface UpgradeModalProps {
feature: string;
onClose: () => void;
}

export function UpgradeModal({ feature, onClose }: UpgradeModalProps) {
return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
<div className="bg-white rounded-lg p-8 max-w-md">
<button
          onClick={onClose}
          className="float-right p-1 hover:bg-gray-100 rounded"
        >
<X className="w-5 h-5" />
</button>

        <h2 className="text-2xl font-bold mb-2">Unlock Premium</h2>
        <p className="text-gray-600 mb-6">
          Get unlimited access to {feature} and more premium features
        </p>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm font-semibold">Two Great Plans</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>• ₹299/month</li>
            <li>• ₹2,999/year (save 40%)</li>
          </ul>
        </div>

        <Link href="/pricing" className="block">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            View All Plans
          </Button>
        </Link>
      </div>
    </div>

);
}

// ============================================================================
// 7. FEATURE COMPARISON TABLE
// ============================================================================

export function PricingComparison() {
return (
<table className="w-full border-collapse">
<thead>
<tr className="bg-gray-100">
<th className="border p-3 text-left">Feature</th>
<th className="border p-3">Free</th>
<th className="border p-3">Premium</th>
</tr>
</thead>
<tbody>
<tr>
<td className="border p-3">Interview Bot</td>
<td className="border p-3">❌</td>
<td className="border p-3">✅</td>
</tr>
<tr>
<td className="border p-3">Resume Parser</td>
<td className="border p-3">❌</td>
<td className="border p-3">✅</td>
</tr>
<tr>
<td className="border p-3">ATS Score</td>
<td className="border p-3">❌</td>
<td className="border p-3">✅</td>
</tr>
<tr>
<td className="border p-3">Career Path</td>
<td className="border p-3">✅</td>
<td className="border p-3">✅</td>
</tr>
</tbody>
</table>
);
}

// ============================================================================
// 8. PAYMENT HISTORY PAGE
// ============================================================================

import { getUserPaymentHistory } from "@/lib/actions/payment.action";

export async function PaymentHistoryPageExample() {
const user = await getCurrentUser();
if (!user?.id) redirect("/sign-in");

const { history } = await getUserPaymentHistory(user.id);

return (
<div className="container mx-auto p-6">
<h1 className="text-3xl font-bold mb-6">Payment History</h1>

      {history.length === 0 ? (
        <p>No payments yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Date</th>
              <th className="border p-3 text-left">Plan</th>
              <th className="border p-3 text-left">Amount</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Expires</th>
            </tr>
          </thead>
          <tbody>
            {history.map((payment: any) => (
              <tr key={payment.id}>
                <td className="border p-3">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
                <td className="border p-3 capitalize">{payment.planType}</td>
                <td className="border p-3">₹{payment.amount / 100}</td>
                <td className="border p-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {payment.status}
                  </span>
                </td>
                <td className="border p-3">
                  {new Date(payment.endDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

);
}

// ============================================================================
// 9. SETTINGS PAGE - CANCEL SUBSCRIPTION
// ============================================================================

import { cancelSubscription } from "@/lib/actions/payment.action";
import { toast } from "sonner";

export function SubscriptionSettingsExample() {
const [cancelling, setCancelling] = useState(false);

const handleCancelSubscription = async (userId: string) => {
if (!confirm("Are you sure? You'll lose access to premium features.")) {
return;
}

    setCancelling(true);
    try {
      const result = await cancelSubscription(userId);
      if (result.success) {
        toast.success("Subscription cancelled");
        window.location.reload();
      } else {
        toast.error("Failed to cancel subscription");
      }
    } finally {
      setCancelling(false);
    }

};

return (
<div className="bg-red-50 p-4 rounded-lg">
<h3 className="font-semibold text-red-900">Cancel Subscription</h3>
<p className="text-sm text-red-800 mt-2">
You'll lose access to all premium features immediately
</p>
<button
onClick={() => handleCancelSubscription("user_id")}
disabled={cancelling}
className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" >
{cancelling ? "Processing..." : "Cancel Subscription"}
</button>
</div>
);
}

export default HomePageExample;
