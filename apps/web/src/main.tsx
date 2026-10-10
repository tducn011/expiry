import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import ScrollbarAutohide from "./components/ui/ScrollbarAutohide"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ScrollbarAutohide />
    <App />
  </React.StrictMode>,
)
