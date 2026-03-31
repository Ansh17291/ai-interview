"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PAYMENT_PLANS } from "@/constants";
import { Check, Loader2 } from "lucide-react";

interface PricingPageProps {
  userId: string;
  userEmail: string;
  userName: string;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name: string;
    email: string;
  };
  theme?: {
    color: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage({
  userId,
  userEmail,
  userName,
}: PricingPageProps) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  const handlePayment = async (planType: "monthly" | "yearly") => {
    try {
      setLoading(planType);

      // Step 1: Create order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          planType,
          email: userEmail,
          name: userName,
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      const { order, keyId } = orderData;

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Step 2: Initialize Razorpay
      const options: RazorpayOptions = {
        key: keyId,
        order_id: order.id,
        name: "IntelliCoach",
        description: `${PAYMENT_PLANS[planType.toUpperCase() as keyof typeof PAYMENT_PLANS].name}`,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#3b82f6",
        },
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                userId,
              }),
            });

            if (!verifyResponse.ok) {
              const error = await verifyResponse.json();
              throw new Error(error.error || "Payment verification failed");
            }

            const verifyData = await verifyResponse.json();
            toast.success("Payment successful! Your premium access is active.");
            
            // Reload page to update user status
            setTimeout(() => window.location.reload(), 1500);
          } catch (error) {
            console.error("Verification error:", error);
            toast.error(error instanceof Error ? error.message : "Payment verification failed");
          } finally {
            setLoading(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Unlock Premium Features
          </h1>
          <p className="text-xl text-slate-300">
            Get unlimited interview practice, resume parsing, and more
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Monthly Plan */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-blue-500 transition">
            <h2 className="text-2xl font-bold text-white mb-2">
              {PAYMENT_PLANS.MONTHLY.name}
            </h2>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">
                {PAYMENT_PLANS.MONTHLY.displayPrice}
              </span>
              <span className="text-slate-400 ml-2">/month</span>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {PAYMENT_PLANS.MONTHLY.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-slate-200">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handlePayment("monthly")}
              disabled={loading !== null}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading === "monthly" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </div>

          {/* Yearly Plan (Recommended) */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-8 border border-blue-500 relative">
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Best Value
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {PAYMENT_PLANS.YEARLY.name}
            </h2>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">
                {PAYMENT_PLANS.YEARLY.displayPrice}
              </span>
              <span className="text-blue-100 ml-2">/year</span>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {PAYMENT_PLANS.YEARLY.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-blue-50">
                  <Check className="w-5 h-5 text-green-300 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handlePayment("yearly")}
              disabled={loading !== null}
              size="lg"
              className="w-full bg-white text-blue-600 hover:bg-slate-100"
            >
              {loading === "yearly" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </div>
        </div>

        {/* FAQs/Features Section */}
        <div className="mt-16 bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6">What's Included</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Interview Bot
              </h4>
              <p className="text-slate-300">
                Practice unlimited interviews with AI-powered feedback
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Resume Parser
              </h4>
              <p className="text-slate-300">
                Parse resumes and get instant ATS scores
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Dedicated Support
              </h4>
              <p className="text-slate-300">
                Get priority support from our team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
