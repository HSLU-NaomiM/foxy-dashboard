import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PathTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/login") {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);

  return null;
}
