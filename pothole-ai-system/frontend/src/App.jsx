import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { ChatWidget } from "@/components/ChatWidget"
import { ReportsProvider } from "@/context/ReportsContext"
import { Landing } from "@/pages/Landing"
import { Dashboard } from "@/pages/Dashboard"
import { TorontoPage } from "@/pages/TorontoPage"
import { Report } from "@/pages/Report"

function App() {
  const [page, setPage] = useState("landing")

  return (
    <ReportsProvider>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Navbar currentPage={page} onNavigate={setPage} />

        {page === "landing" && <Landing />}
        {page === "dashboard" && <Dashboard />}
        {page === "toronto" && <TorontoPage />}
        {page === "report" && <Report onNavigate={setPage} />}

        {page !== "landing" && <ChatWidget />}
      </div>
    </ReportsProvider>
  )
}

export default App
