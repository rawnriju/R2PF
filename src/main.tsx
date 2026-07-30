
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router";
  import App from "./app/App.tsx";
  import { ThemeProvider } from "./app/theme.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
