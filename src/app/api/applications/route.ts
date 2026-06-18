import { NextRequest, NextResponse } from "next/server";
import pool from "../db";

const generateApplicationNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `APP-${timestamp}-${random}`;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const grade = url.searchParams.get("grade") || "";

  const conditions = ["1=1"];
  const values: Array<string> = [];

  if (search.trim()) {
    conditions.push("(application_number LIKE ? OR first_name LIKE ? OR last_name LIKE ?)");
    const wildcard = `%${search.trim()}%`;
    values.push(wildcard, wildcard, wildcard);
  }

  if (status && status !== "all") {
    conditions.push("status = ?");
    values.push(status);
  }

  if (grade && grade !== "all") {
    conditions.push("grade = ?");
    values.push(grade);
  }

  const query = `SELECT id, application_number, first_name, last_name, grade, status, created_at FROM applications WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT 50`;
  const [rows] = await pool.query(query, values);

  return NextResponse.json({ applications: rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    grade,
    parentName,
    parentPhone,
    parentEmail,
    address,
  } = body;

  const applicationNumber = generateApplicationNumber();

  const insertQuery = `INSERT INTO applications (application_number, first_name, last_name, date_of_birth, gender, grade, parent_name, parent_phone, parent_email, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await pool.execute(insertQuery, [
    applicationNumber,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    grade,
    parentName,
    parentPhone,
    parentEmail,
    address,
  ]);

  return NextResponse.json({ applicationNumber });
}
