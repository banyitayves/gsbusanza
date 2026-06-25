import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { RowDataPacket } from "mysql2";
import pool from "../db";
import { getAuthUser } from "../auth/utils";

const uploadsPath = path.join(process.cwd(), "public", "uploads");

async function ensureUploadsPath() {
  await fs.mkdir(uploadsPath, { recursive: true });
}

const generateApplicationNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `APP-${timestamp}-${random}`;
};

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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

  const query = `SELECT id, application_number, first_name, last_name, grade, status, created_at, sdms_code, marks_obtained, province, district, sector, cell, village FROM applications WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT 50`;
  const [rows] = await pool.query(query, values);

  return NextResponse.json({ applications: rows });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const dateOfBirth = formData.get("dateOfBirth");
  const gender = formData.get("gender");
  const grade = formData.get("grade");
  const province = formData.get("province");
  const district = formData.get("district");
  const sector = formData.get("sector");
  const cell = formData.get("cell");
  const village = formData.get("village");
  const sdmsCode = formData.get("sdmsCode");
  const marksObtained = formData.get("marksObtained");
  const parentName = formData.get("parentName");
  const parentPhone = formData.get("parentPhone");
  const parentEmail = formData.get("parentEmail");
  const address = formData.get("address");
  const paymentSlip = formData.get("paymentSlip");

  const requiredValues = [
    firstName,
    lastName,
    dateOfBirth,
    gender,
    grade,
    province,
    district,
    sector,
    cell,
    village,
    sdmsCode,
    marksObtained,
    parentName,
    parentPhone,
    parentEmail,
    address,
  ];

  if (requiredValues.some((value) => typeof value !== "string" || value.trim() === "")) {
    return NextResponse.json({ error: "Missing required application fields." }, { status: 400 });
  }

  const applicationNumber = generateApplicationNumber();

  const insertQuery = `INSERT INTO applications (application_number, first_name, last_name, date_of_birth, gender, grade, province, district, sector, cell, village, sdms_code, marks_obtained, parent_name, parent_phone, parent_email, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  await pool.execute(insertQuery, [
    applicationNumber,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    grade,
    province,
    district,
    sector,
    cell,
    village,
    sdmsCode,
    marksObtained,
    parentName,
    parentPhone,
    parentEmail,
    address,
  ]);

  if (paymentSlip && typeof (paymentSlip as File).arrayBuffer === "function") {
    const incomingFile = paymentSlip as File;
    const buffer = Buffer.from(await incomingFile.arrayBuffer());
    await ensureUploadsPath();
    const safeName = incomingFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedFileName = `${Date.now()}-${safeName}`;
    await fs.writeFile(path.join(uploadsPath, storedFileName), buffer);
    const fileUrl = `/uploads/${storedFileName}`;

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM applications WHERE application_number = ? LIMIT 1",
      [applicationNumber]
    );
    const application = rows[0] as RowDataPacket | undefined;

    if (application) {
      await pool.execute(
        "INSERT INTO documents (application_id, document_type, file_name, file_url) VALUES (?, ?, ?, ?)",
        [application.id, "Payment Slip", incomingFile.name, fileUrl]
      );
    }
  }

  return NextResponse.json({ applicationNumber });
}
