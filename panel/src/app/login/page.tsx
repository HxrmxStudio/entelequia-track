"use client";
import { useState } from "react";
import { API_URL } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@entelequia.local");
  const [password, setPassword] = useState("admin1234");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) return setErr("Credenciales inválidas");
    const j = await r.json();
    localStorage.setItem("token", j.token);
    window.location.href = "/import";
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="border p-2 w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        {err && <p className="text-red-600">{err}</p>}
        <button className="bg-black text-white px-4 py-2 rounded">Entrar</button>
      </form>
    </div>
  );
}
