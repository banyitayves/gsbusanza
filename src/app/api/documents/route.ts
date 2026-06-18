import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import pool from "../db";

const uploadsPath = path.join(process.cwd(), "public", "uploads");

async function ensureUploadsPath() {
  await fs.mkdir(uploadsPath, { recursive: true });
}

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const applicationNumber = url.searchParams.get("applicationNumber") || "";
  const documentType = url.searchParams.get("type") || "";

  const conditions = ["1=1"];
  const values: Array<string> = [];

  if (applicationNumber.trim()) {
    conditions.push("a.application_number = ?");
    values.push(applicationNumber.trim());
  }

  if (documentType.trim()) {
    conditions.push("d.document_type = ?");
    values.push(documentType.trim());
  }

  const query = `SELECT d.id, d.document_type, d.file_name, d.file_url, d.uploaded_at, a.application_number, a.first_name, a.last_name FROM documents d JOIN applications a ON d.application_id = a.id WHERE ${conditions.join(" AND ")} ORDER BY d.uploaded_at DESC LIMIT 100`;
  const [rows] = await pool.query(query, values);
  return NextResponse.json({ documents: rows });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const applicationNumber = formData.get("applicationNumber");
  const documentType = formData.get("documentType");
  const file = formData.get("file");

  if (!applicationNumber || typeof applicationNumber !== "string") {
    return NextResponse.json({ error: "Missing application number." }, { status: 400 });
  }

  if (!documentType || typeof documentType !== "string") {
    return NextResponse.json({ error: "Missing document type." }, { status: 400 });
  }

  if (!file || typeof (file as File).arrayBuffer !== "function") {
    return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
  }

  const [[application]] = await pool.query(
    "SELECT id FROM applications WHERE application_number = ? LIMIT 1",
    [applicationNumber.trim()]
  );

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const incomingFile = file as File;
  const buffer = Buffer.from(await incomingFile.arrayBuffer());
  await ensureUploadsPath();

  const safeName = incomingFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedFileName = `${Date.now()}-${safeName}`;
  await fs.writeFile(path.join(uploadsPath, storedFileName), buffer);

  const fileUrl = `/uploads/${storedFileName}`;
  await pool.execute(
    "INSERT INTO documents (application_id, document_type, file_name, file_url) VALUES (?, ?, ?, ?)",
    [application.id, documentType.trim(), incomingFile.name, fileUrl]
  );

  return NextResponse.json({ success: true, fileUrl });
}
