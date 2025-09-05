import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getVerificationStatus } from "@/lib/stripe-identity";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const status = await getVerificationStatus(session.user.id);

    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Get verification status error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to get verification status" },
      { status: 500 }
    );
  }
}