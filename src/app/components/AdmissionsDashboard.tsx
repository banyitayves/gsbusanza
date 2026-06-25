"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

type Application = {
  id: number;
  application_number: string;
  first_name: string;
  last_name: string;
  grade: string;
  status: string;
  created_at: string;
  sdms_code: string;
  marks_obtained: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
};

const statusLabel = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "approved") return "status-approved";
  if (normalized === "rejected") return "status-rejected";
  return "status-pending";
};

export function AdmissionsDashboard() {
  const { user, loading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    const query = new URLSearchParams();
    if (filterStatus !== "all") query.set("status", filterStatus);
    if (filterGrade !== "all") query.set("grade", filterGrade);
    if (search.trim()) query.set("search", search.trim());

    const url = `/api/applications?${query.toString()}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      setApplications(data.applications);
    }
  }

  async function updateStatus(id: number, nextStatus: string) {
    const response = await fetch(`/api/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (response.ok) {
      await fetchApplications();
    }
  }

  if (loading) {
    return <p>Loading authentication...</p>;
  }

  if (!user) {
    return <p className="card">Please log in as admin or staff to view and manage applications.</p>;
  }

  return (
    <div>
      <h2>Admissions Dashboard</h2>
      <div className="grid" style={{ gap: 12, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search by student or application number"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onBlur={fetchApplications}
        />

        <div className="grid grid-2">
          <select
            className="select"
            value={filterGrade}
            onChange={(event) => {
              setFilterGrade(event.target.value);
              fetchApplications();
            }}
          >
            <option value="all">All grades</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
          </select>

          <select
            className="select"
            value={filterStatus}
            onChange={(event) => {
              setFilterStatus(event.target.value);
              fetchApplications();
            }}
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card">
        {applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <div className="grid" style={{ gap: 12 }}>
            {applications.map((application) => (
              <div key={application.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <p>
                      <strong>{application.first_name} {application.last_name}</strong>
                    </p>
                    <p>#{application.application_number}</p>
                    <p>{application.grade}</p>
                    <p>SDMS: {application.sdms_code}</p>
                    <p>Marks: {application.marks_obtained}</p>
                    <p>
                      Residence: {application.province}, {application.district}, {application.sector}, {application.cell}, {application.village}
                    </p>
                  </div>
                  <span className={`status-pill ${statusLabel(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="button" onClick={() => updateStatus(application.id, "Approved")}>Approve</button>
                  <button className="button secondary" onClick={() => updateStatus(application.id, "Rejected")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
