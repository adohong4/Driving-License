import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { Web3Provider } from "./contexts/Web3Context.jsx"
import { Toaster } from "react-hot-toast"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Web3Provider>
      <App />
      <Toaster position="top-right" />
    </Web3Provider>
  </React.StrictMode>,
)
