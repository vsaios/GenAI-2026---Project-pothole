import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Log in</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-slate-200">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-200">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
          />
        </div>
        {error && (
          <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-slate-400">
        No account?{" "}
        <Link to="/signup" className="text-emerald-400 hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  )
}
