"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";

type FormState = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  grade: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  sdmsCode: string;
  marksObtained: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
};

const GRADE_OPTIONS = [
  "Nursery 1",
  "Nursery 2",
  "Nursery 3",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "Secondary 1",
  "Secondary 2",
  "Secondary 3",
  "Secondary 4",
  "Secondary 5",
  "Secondary 6",
];

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  grade: "",
  province: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
  sdmsCode: "",
  marksObtained: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  address: "",
};

export function StudentRegistrationForm() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [applicationNumber, setApplicationNumber] = useState<string | null>(null);
  const paymentSlipRef = useRef<HTMLInputElement | null>(null);

  const valid = useMemo(
    () =>
      Object.values(form).every((value) => value.trim().length > 0) &&
      form.parentEmail.includes("@") &&
      paymentSlip !== null,
    [form, paymentSlip]
  );

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setStatus(null);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (paymentSlip) {
      formData.append("paymentSlip", paymentSlip);
    }

    const response = await fetch("/api/applications", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setStatus("Failed to submit application.");
      return;
    }

    const data = await response.json();
    setApplicationNumber(data.applicationNumber);
    setStatus("Application submitted successfully.");
    setForm(initialFormState);
    setPaymentSlip(null);
    if (paymentSlipRef.current) {
      paymentSlipRef.current.value = "";
    }
  }

  if (loading) {
    return <p>Loading authentication...</p>;
  }

  return (
    <div>
      <h2>Student Registration</h2>
      <form className="grid" style={{ gap: 16 }} onSubmit={submitForm}>
        <div className="grid grid-2">
          <label>
            First name
            <input
              className="input"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            />
          </label>
          <label>
            Last name
            <input
              className="input"
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            />
          </label>
        </div>

        <div className="grid grid-2">
          <label>
            Date of birth
            <input
              className="input"
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })}
            />
          </label>
          <label>
            Gender
            <select
              className="select"
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value })}
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
            </select>
          </label>
        </div>

        <div className="grid grid-2">
          <label>
            Grade applying for
            <select
              className="select"
              value={form.grade}
              onChange={(event) => setForm({ ...form, grade: event.target.value })}
            >
              <option value="">Select grade</option>
              {GRADE_OPTIONS.map((gradeOption) => (
                <option key={gradeOption} value={gradeOption}>
                  {gradeOption}
                </option>
              ))}
            </select>
          </label>
          <label>
            SDMS Code
            <input
              className="input"
              value={form.sdmsCode}
              onChange={(event) => setForm({ ...form, sdmsCode: event.target.value })}
            />
          </label>
        </div>

        <div className="grid grid-2">
          <label>
            Marks obtained
            <input
              className="input"
              type="number"
              value={form.marksObtained}
              onChange={(event) => setForm({ ...form, marksObtained: event.target.value })}
            />
          </label>
          <label>
            Province
            <input
              className="input"
              value={form.province}
              onChange={(event) => setForm({ ...form, province: event.target.value })}
            />
          </label>
        </div>

        <div className="grid grid-2">
          <label>
            District
            <input
              className="input"
              value={form.district}
              onChange={(event) => setForm({ ...form, district: event.target.value })}
            />
          </label>
          <label>
            Sector
            <input
              className="input"
              value={form.sector}
              onChange={(event) => setForm({ ...form, sector: event.target.value })}
            />
          </label>
        </div>

        <div className="grid grid-2">
          <label>
            Cell
            <input
              className="input"
              value={form.cell}
              onChange={(event) => setForm({ ...form, cell: event.target.value })}
            />
          </label>
          <label>
            Village
            <input
              className="input"
              value={form.village}
              onChange={(event) => setForm({ ...form, village: event.target.value })}
            />
          </label>
        </div>

        <div className="grid grid-2">
          <label>
            Parent/guardian name
            <input
              className="input"
              value={form.parentName}
              onChange={(event) => setForm({ ...form, parentName: event.target.value })}
            />
          </label>
        </div>

        <div className="grid grid-2">
          <label>
            Parent phone
            <input
              className="input"
              value={form.parentPhone}
              onChange={(event) => setForm({ ...form, parentPhone: event.target.value })}
            />
          </label>
          <label>
            Parent email
            <input
              className="input"
              type="email"
              value={form.parentEmail}
              onChange={(event) => setForm({ ...form, parentEmail: event.target.value })}
            />
          </label>
        </div>

        <label>
          Payment slip upload
          <input
            ref={paymentSlipRef}
            className="input"
            type="file"
            accept="image/*,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setPaymentSlip(file);
            }}
          />
        </label>

        <label>
          Home address
          <textarea
            className="textarea"
            rows={4}
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
          />
        </label>

        <button className="button" type="submit" disabled={!valid}>
          Submit application
        </button>
      </form>

      {status ? <p style={{ marginTop: 16 }}>{status}</p> : null}
      {applicationNumber ? (
        <p style={{ marginTop: 8 }}>
          Application number: <strong>{applicationNumber}</strong>
        </p>
      ) : null}
    </div>
  );
}
