import { createRoot } from "react-dom/client";
// queryClient'ı en başta import et ki fetch wrapper çalışsın
import "./lib/queryClient";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
