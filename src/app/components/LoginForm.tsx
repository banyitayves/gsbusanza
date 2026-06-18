"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    try {
      await login(email, password);
    } catch (error) {
      setStatus("Invalid credentials. Try admin login.");
    }
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <form className="grid" style={{ gap: 16 }} onSubmit={handleSubmit}>
        <label>
          Email
          <input
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
          />
        </label>
        <label>
          Password
          <input
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>
        <button className="button" type="submit">
          Log in
        </button>
      </form>
      {status ? <p style={{ marginTop: 16 }}>{status}</p> : null}
    </div>
  );
}
