"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

type UserRecord = {
  id: number;
  email: string;
  role: string;
  created_at: string;
};

export function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user]);

  async function loadUsers() {
    const response = await fetch("/api/auth/users");
    if (!response.ok) {
      setStatus("Unable to load users.");
      return;
    }
    const data = await response.json();
    setUsers(data.users || []);
  }

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/auth/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, password: newPassword }),
    });

    if (!response.ok) {
      setStatus("Unable to create user.");
      return;
    }

    setStatus("Staff access granted.");
    setNewEmail("");
    setNewPassword("");
    loadUsers();
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div>
      <h2>Admin User Access</h2>
      <p>Only admin can grant registration access to others.</p>
      <form className="grid" style={{ gap: 16 }} onSubmit={createUser}>
        <div className="grid grid-2">
          <label>
            Staff email
            <input
              className="input"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              type="email"
            />
          </label>
          <label>
            Temporary password
            <input
              className="input"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
            />
          </label>
        </div>
        <button className="button" type="submit">
          Grant access
        </button>
      </form>
      {status ? <p style={{ marginTop: 16 }}>{status}</p> : null}

      <div style={{ marginTop: 20 }}>
        <h3>Staff users</h3>
        <ul>
          {users.map((entry) => (
            <li key={entry.id}>
              {entry.email} — {entry.role}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
