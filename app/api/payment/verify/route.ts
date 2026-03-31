import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentAndCreateSubscription } from "@/lib/actions/payment.action";

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and creates subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature, userId } = await request.json();

    if (!orderId || !paymentId || !signature || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await verifyPaymentAndCreateSubscription({
      orderId,
      paymentId,
      signature,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
