import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createVerificationSession } from "@/lib/stripe-identity";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const verificationSession = await createVerificationSession(session.user.id);

    return NextResponse.json({
      url: verificationSession.url,
      sessionId: verificationSession.id,
    });
  } catch (error: any) {
    console.error("Start verification error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to start verification" },
      { status: 500 }
    );
  }
}