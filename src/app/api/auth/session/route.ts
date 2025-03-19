import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    // Return the session data in the expected format
    return NextResponse.json(session);
}

// Set to dynamic to prevent caching
export const dynamic = 'force-dynamic'; 