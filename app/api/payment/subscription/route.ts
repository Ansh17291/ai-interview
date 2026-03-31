import { NextRequest, NextResponse } from "next/server";
import { getUserSubscription } from "@/lib/actions/payment.action";

/**
 * GET /api/payment/subscription?userId=<userId>
 * Gets user subscription status
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const result = await getUserSubscription(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
