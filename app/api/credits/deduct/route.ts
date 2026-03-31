import { deductCredits } from "@/lib/actions/credits.action";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/credits/deduct
 * Deduct credits from user balance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, feature, credits, description } = body;

    if (!userId || !feature || !credits) {
      return NextResponse.json(
        {
          error: "userId, feature, and credits are required",
        },
        { status: 400 }
      );
    }

    const result = await deductCredits({
      userId,
      feature,
      credits: parseInt(credits),
      description: description || `Credits spent on ${feature}`,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          available: (result as any).available,
          needed: (result as any).needed,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      creditsSpent: result.creditsSpent,
      message: `${result.creditsSpent} credits spent on ${feature}`,
    });
  } catch (error) {
    console.error("Error deducting credits:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to deduct credits",
      },
      { status: 500 }
    );
  }
}
