import { getCreditHistory } from "@/lib/actions/credits.action";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/credits/history
 * Get user credit usage history
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit") || "20";

    if (!userId) {
      return NextResponse.json(
        {
          error: "userId is required",
        },
        { status: 400 }
      );
    }

    const result = await getCreditHistory(userId, parseInt(limit));

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          history: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      history: result.history,
      count: result.history.length,
    });
  } catch (error) {
    console.error("Error fetching credit history:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch history",
        history: [],
      },
      { status: 500 }
    );
  }
}
