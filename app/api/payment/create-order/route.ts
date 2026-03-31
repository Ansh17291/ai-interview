import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/actions/payment.action";

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order for payment
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, planType, email, name } = await request.json();

    if (!userId || !planType || !email || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createRazorpayOrder({
      userId,
      planType,
      email,
      name,
      amount: 0, // Will be calculated based on plan type in the action
    } as any);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
