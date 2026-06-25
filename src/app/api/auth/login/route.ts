import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "../../db";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  createSessionToken,
  hashPassword,
  verifyPassword,
} from "../utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = (body.email || "").toString().trim().toLowerCase();
  const password = (body.password || "").toString();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(24) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  let user = rows[0] as RowDataPacket | undefined;

  if (!user) {
    const [countRows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS count FROM users");
    const count = Number(countRows[0]?.count || 0);

    if (count === 0 && email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const passwordHash = hashPassword(password);
      const [result] = await pool.execute(
        "INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, NOW())",
        [email, passwordHash, "admin"]
      );
      const insertId = (result as any).insertId;
      user = { id: insertId, email, password_hash: passwordHash, role: "admin" } as RowDataPacket;
    } else if (count === 0) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
  }

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const authUser = {
    id: Number(user.id),
    email: user.email,
    role: user.role as "admin" | "staff",
  };
  const token = createSessionToken(authUser);

  const response = NextResponse.json({ user: { email: authUser.email, role: authUser.role } });
  response.cookies.set(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
