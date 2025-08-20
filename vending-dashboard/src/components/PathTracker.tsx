// src/components/PathTracker.tsx
// File Summary:
// Tracks the last visited path (except login) and stores it in localStorage.
// Useful for restoring navigation state after reload or re-login.
//
// Key responsibilities:
// - Observe route changes via react-router's useLocation.
// - Save the last non-login path to localStorage under "lastPath".
// - Render nothing; side-effect only.
//
// Dependencies:
// - react-router-dom: useLocation to detect route changes.
// - localStorage: persist last visited path.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// PathTracker component
export default function PathTracker() {
  const location = useLocation();

  useEffect(() => {
    // Skip saving when on the login page
    if (location.pathname !== "/login") {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);

  // No UI rendering
  return null;
}
