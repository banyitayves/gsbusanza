"use client";

import { useMemo, useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
};

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  grade: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  address: "",
};

export function StudentRegistrationForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<string | null>(null);
  const [applicationNumber, setApplicationNumber] = useState<string | null>(null);

  const valid = useMemo(
    () =>
      Object.values(form).every((value) => value.trim().length > 0) &&
      form.parentEmail.includes("@"),
    [form]
  );

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setStatus("Failed to submit application.");
      return;
    }

    const data = await response.json();
    setApplicationNumber(data.applicationNumber);
    setStatus("Application submitted successfully.");
    setForm(initialFormState);
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
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
            </select>
          </label>
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
