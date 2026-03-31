"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface FreemiumBannerProps {
  isPremium: boolean;
  daysRemaining?: number;
}

export default function FreemiumBanner({
  isPremium,
  daysRemaining,
}: FreemiumBannerProps) {
  const [closed, setClosed] = useState(false);

  if (closed || isPremium) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg mb-6 flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-lg">Unlock Premium Features</h3>
        <p className="text-blue-100 text-sm">
          Get unlimited access to Interview Bot, Resume Parser, and more
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/pricing">
          <Button className="bg-white text-blue-600 hover:bg-slate-100">
            Upgrade Now
          </Button>
        </Link>
        <button
          onClick={() => setClosed(true)}
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function PremiumExpiringBanner({
  daysRemaining,
}: {
  daysRemaining?: number;
}) {
  const [closed, setClosed] = useState(false);

  if (closed || !daysRemaining || daysRemaining > 7) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-lg mb-6 flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-lg">Your Premium Expires Soon</h3>
        <p className="text-orange-100 text-sm">
          {daysRemaining === 1
            ? "Your premium membership expires tomorrow"
            : `Your premium membership expires in ${daysRemaining} days`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/pricing">
          <Button className="bg-white text-orange-600 hover:bg-slate-100">
            Renew Now
          </Button>
        </Link>
        <button
          onClick={() => setClosed(true)}
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
