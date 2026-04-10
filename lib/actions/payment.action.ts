"use server";

import { auth, db } from "@/firebase/admin";
import Razorpay from "razorpay";
import crypto from "crypto";
import { PAYMENT_PLANS, RAZORPAY_CONFIG } from "@/constants";
import { grantCredits } from "@/lib/actions/credits.action";

// Lazy initialize Razorpay instance (only when needed, not at import time)
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
  }
  return razorpayInstance;
}

/**
 * Create a Razorpay order for payment
 */
export async function createRazorpayOrder(params: CreateOrderParams) {
  try {
    const { userId, planType, email, name } = params;

    const plan =
      PAYMENT_PLANS[planType.toUpperCase() as keyof typeof PAYMENT_PLANS];
    if (!plan) {
      return {
        success: false,
        error: "Invalid plan type",
      };
    }

    const order = await getRazorpayInstance().orders.create({
      amount: plan.price,
      currency: RAZORPAY_CONFIG.CURRENCY,
      receipt: `${RAZORPAY_CONFIG.RECEIPT_PREFIX}${userId}_${Date.now()}`,
      notes: {
        userId,
        planType,
        email,
        name,
      },
    });

    return {
      success: true,
      order: order,
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

/**
 * Verify Razorpay payment signature and create subscription
 */
export async function verifyPaymentAndCreateSubscription(
  params: VerifyPaymentParams
) {
  try {
    const { orderId, paymentId, signature, userId } = params;

    // Verify signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return {
        success: false,
        error: "Invalid payment signature",
      };
    }

    // Fetch payment details to verify
    const payment = await getRazorpayInstance().payments.fetch(paymentId);

    if (payment.status !== "captured") {
      return {
        success: false,
        error: "Payment not successful",
      };
    }

    // Get order details
    const order = await getRazorpayInstance().orders.fetch(orderId);
    const planType =
      (order.notes?.planType as "monthly" | "yearly") || "monthly";
    const plan =
      PAYMENT_PLANS[planType.toUpperCase() as keyof typeof PAYMENT_PLANS];

    // Create subscription in Firestore
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + plan.validityDays * 24 * 60 * 60 * 1000
    );

    const subscription = {
      userId,
      orderId,
      paymentId,
      planType,
      amount: plan.price,
      currency: RAZORPAY_CONFIG.CURRENCY,
      status: "success",
      startDate: now.toISOString(),
      endDate: expiresAt.toISOString(),
      autoRenew: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Save subscription
    await db.collection("subscriptions").add(subscription);

    // Update user document with premium status
    await db.collection("users").doc(userId).update({
      isPremium: true,
      premiumExpiresAt: expiresAt.toISOString(),
      subscriptionId: orderId,
      paymentId: paymentId,
    });

    // Grant credits based on plan type
    const creditsResult = await grantCredits(userId, planType);

    return {
      success: true,
      subscription,
      expiresAt: expiresAt.toISOString(),
      credits: creditsResult.success ? creditsResult.credits : undefined,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to verify payment",
    };
  }
}

/**
 * Get user subscription status
 */
export async function getUserSubscription(userId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        isPremium: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data() as any;
    
    // BACKDOOR FOR TESTING: email ansh2shweta@gmail.com is always premium
    if (userData.email === "ansh2shweta@gmail.com") {
      return {
        success: true,
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        daysRemaining: 365,
      };
    }

    const isPremium = userData.isPremium || false;
    const premiumExpiresAt = userData.premiumExpiresAt;

    // Check if premium has expired
    if (isPremium && premiumExpiresAt) {
      const expiresDate = new Date(premiumExpiresAt);
      if (new Date() > expiresDate) {
        return {
          success: true,
          isPremium: false,
          isExpired: true,
          message: "Premium subscription has expired",
        };
      }
    }

    return {
      success: true,
      isPremium,
      premiumExpiresAt,
      daysRemaining: premiumExpiresAt
        ? Math.ceil(
            (new Date(premiumExpiresAt).getTime() - new Date().getTime()) /
              (24 * 60 * 60 * 1000)
          )
        : 0,
    };
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return {
      success: false,
      isPremium: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch subscription",
    };
  }
}

/**
 * Check if user has access to premium features
 */
export async function checkPremiumAccess(userId: string): Promise<boolean> {
  try {
    const result = await getUserSubscription(userId);
    return result.success && result.isPremium;
  } catch {
    return false;
  }
}

/**
 * Get user payment history
 */
export async function getUserPaymentHistory(userId: string) {
  try {
    const subscriptions = await db
      .collection("subscriptions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const history = subscriptions.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      history,
    };
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return {
      success: false,
      history: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch payment history",
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string) {
  try {
    await db.collection("users").doc(userId).update({
      isPremium: false,
      premiumExpiresAt: null,
      subscriptionId: null,
    });

    return {
      success: true,
      message: "Subscription cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
    };
  }
}
