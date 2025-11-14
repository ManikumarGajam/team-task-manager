import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

export default function AppNavbar({ onToggleSidebar }) {
  const { dark, setDark } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar app-navbar px-3">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary d-md-none" onClick={onToggleSidebar}>
            ☰
          </button>
          <div>
            <strong>Team Task Manager</strong>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm"
            onClick={() => setDark(!dark)}
            title="Toggle theme"
          >
            {dark ? "🌙" : "☀️"}
          </button>

          <div className="dropdown">
            <button className="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
              {user?.name || "User"}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><span className="dropdown-item-text">{user?.email}</span></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item" onClick={logout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
