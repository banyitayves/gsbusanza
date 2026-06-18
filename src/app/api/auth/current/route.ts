import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "../utils";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  return NextResponse.json({ user: user ? { email: user.email, role: user.role } : null });
}
