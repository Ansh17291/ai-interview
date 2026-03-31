import { getUserCredits, hasEnoughCredits } from "@/lib/actions/credits.action";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/credits/check
 * Check if user has enough credits for an action
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const feature = searchParams.get("feature");
    const needed = searchParams.get("needed");

    if (!userId) {
      return NextResponse.json(
        {
          error: "userId is required",
        },
        { status: 400 }
      );
    }

    // Get user credits
    const creditsResult = await getUserCredits(userId);

    if (!creditsResult.success) {
      return NextResponse.json(
        {
          error: creditsResult.error,
        },
        { status: 404 }
      );
    }

    // Check if enough credits
    if (feature && needed) {
      const creditsNeeded = parseInt(needed);
      const hasEnough = await hasEnoughCredits(userId, feature, creditsNeeded);

      return NextResponse.json({
        success: true,
        credits: creditsResult.credits,
        feature,
        creditsNeeded,
        hasEnough,
        daysUntilRefresh: creditsResult.daysUntilRefresh,
        message: hasEnough
          ? `Has enough credits for ${feature}`
          : `Insufficient credits for ${feature}`,
      });
    }

    // Just return balance
    return NextResponse.json({
      success: true,
      credits: creditsResult.credits,
      daysUntilRefresh: creditsResult.daysUntilRefresh,
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check credits",
      },
      { status: 500 }
    );
  }
}
