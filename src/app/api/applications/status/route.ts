import { NextRequest, NextResponse } from "next/server";
import pool from "../../db";

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { status } = body;
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const applicationId = parts[parts.length - 1];

  if (!applicationId) {
    return NextResponse.json({ error: "Missing application ID." }, { status: 400 });
  }

  await pool.execute("UPDATE applications SET status = ? WHERE id = ?", [status, Number(applicationId)]);
  return NextResponse.json({ success: true });
}
