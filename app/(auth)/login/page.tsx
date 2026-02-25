 "use client";
 
 import { useState } from "react";
 import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api-client";
 
 export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
  const { token, user } = await api.auth.login(form);
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  router.push("/");
  } catch (err) {
  setError(err instanceof Error ? err.message : "Login failed");
  } finally {
  setLoading(false);
  }
  }
 
  return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
      <div className="flex flex-col items-center">
        <div className="h-14 w-14 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6M9 16h6M7 7h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5h6" />
          </svg>
        </div>

        <h1 className="mt-4 text-lg font-semibold text-gray-900">TaskFlow</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded">{error}</div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-600">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="mt-1 w-full border border-gray-200 text-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-600">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="mt-1 w-full border border-gray-200 text-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-600 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  </div>
  );
 }
