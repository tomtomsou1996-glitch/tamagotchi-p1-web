import "./index.css";

import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

Sentry.init({
  dsn: "https://04851436c4f309ca0eec04b2f760573a@o4509035101028352.ingest.us.sentry.io/4509035102666752",
});

const root = document.getElementById("root");
if (root != null) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
