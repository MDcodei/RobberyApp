import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.css";

export default function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="nav">
      <div className="nav-left">
        <span className="brand">GR App</span>
      </div>
      <div className="nav-right">
        <Link to="/" className={`nav-btn ${pathname === "/" ? "active" : ""}`}>
          Plan Heist
        </Link>
        <Link to="/planned" className={`nav-btn ${pathname === "/planned" ? "active" : ""}`}>
          View Planned Heists
        </Link>
      </div>
    </nav>
  );
}
