import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { status } = body;

  if (!params?.id) {
    return NextResponse.json({ error: "Missing application ID." }, { status: 400 });
  }

  await pool.execute("UPDATE applications SET status = ? WHERE id = ?", [status, Number(params.id)]);
  return NextResponse.json({ success: true });
}
