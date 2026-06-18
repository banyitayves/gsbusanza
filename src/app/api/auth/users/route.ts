import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "../../db";
import { getAuthUser, hashPassword } from "../utils";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  return NextResponse.json({ users: rows });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const email = (body.email || "").toString().trim().toLowerCase();
  const password = (body.password || "").toString();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const passwordHash = hashPassword(password);
  await pool.execute(
    "INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, NOW())",
    [email, passwordHash, "staff"]
  );

  return NextResponse.json({ success: true });
}
