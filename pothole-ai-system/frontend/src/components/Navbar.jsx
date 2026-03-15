import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function Navbar() {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isLoggedIn = !!user

  async function handleLogout() {
    try {
      await logout()
      navigate("/home")
    } catch {
      navigate("/home")
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
      <div className="flex items-center gap-2">
        <Link
          to="/home"
          className="text-xl font-semibold tracking-tight text-slate-50 hover:text-white"
        >
          Rua
        </Link>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase text-emerald-300">
          beta
        </span>
      </div>

      <nav className="flex items-center gap-3 text-sm">
        {!loading && isLoggedIn && (
          <>
            <Link
              to="/dashboard"
              className={`rounded px-3 py-1 ${
                location.pathname === "/dashboard"
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-800 text-slate-100 hover:bg-slate-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/toronto"
              className={`rounded px-3 py-1 ${
                location.pathname === "/toronto"
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-800 text-slate-100 hover:bg-slate-700"
              }`}
            >
              Toronto Map
            </Link>
          </>
        )}
      </nav>

      <div className="flex items-center gap-2">
        {!loading && !isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:bg-slate-800/80"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition-colors hover:bg-white"
            >
              Sign Up
            </Link>
          </>
        ) : isLoggedIn ? (
          <>
            <span className="max-w-[140px] truncate text-xs text-slate-400">{user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:bg-slate-800/80"
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}
