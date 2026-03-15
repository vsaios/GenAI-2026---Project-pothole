import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { ChatWidget } from "@/components/ChatWidget"
import { ReportsProvider } from "@/context/ReportsContext"
import { Landing } from "@/pages/Landing"
import { Dashboard } from "@/pages/Dashboard"
import { TorontoPage } from "@/pages/TorontoPage"
import { Report } from "@/pages/Report"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"

function App() {
  const [page, setPage] = useState("landing")

  return (
    <ReportsProvider>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Navbar currentPage={page} onNavigate={setPage} />

        {page === "landing" && <Landing />}
        {page === "dashboard" && <Dashboard onNavigate={setPage} />}
        {page === "toronto" && <TorontoPage />}
        {page === "report" && <Report onNavigate={setPage} />}
        {page === "login" && <Login onNavigate={setPage} />}
        {page === "signup" && <Signup onNavigate={setPage} />}

        {page !== "landing" && page !== "login" && page !== "signup" && <ChatWidget />}
      </div>
    </ReportsProvider>
  )
}

export default App
