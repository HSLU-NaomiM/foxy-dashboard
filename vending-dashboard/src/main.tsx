// src/main.tsx
// File Summary:
// Application bootstrap file.  
// Responsible for mounting the React app into the DOM and enabling global configuration.
//
// Key responsibilities:
// - Initialize React root rendering with `ReactDOM.createRoot`.
// - Wrap `<App />` in `<React.StrictMode>` to highlight potential problems during development.
// - Import global styles (`index.css`) and i18n configuration (`i18n/i18n`).
// - Mount the app into the `<div id="root">` container defined in `index.html`.
//
// How it's used:
// - This is the true entry point of the application when bundled by Vite/React.
// - Imports `App.tsx` which contains all routes and global listeners.
// - Executed automatically when the app starts in the browser.
//
// Dependencies:
// - React 18 (`ReactDOM.createRoot`).
// - Global CSS for styles.
// - i18next initialization for translations.
//
// Security notes:
// - No direct user input handled here.
// - Ensure `#root` exists in `index.html` to avoid runtime null errors.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n/i18n";

// Mounts the React application into the HTML element with id="root"
ReactDOM.createRoot(document.getElementById("root")!).render(
  // StrictMode helps catch potential issues in development (runs extra checks/effects)
  <React.StrictMode>
    {/* App.tsx handles routing, layout, and global auth logic */}
    <App />
  </React.StrictMode>
);
