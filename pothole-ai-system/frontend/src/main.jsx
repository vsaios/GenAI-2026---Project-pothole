import React from "react"
import ReactDOM from "react-dom/client"
import "mapbox-gl/dist/mapbox-gl.css"
import App from "./App"
import "./styles/tailwind.css"
import { AuthProvider } from "./context/AuthContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
