import { useState } from "react";
import "./index.css";

function Nav({ onNavigate, activeView }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (view) => {
    onNavigate(view);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="topbar">
        <div className="logo">
          Research<span> / </span>Agent
        </div>
        <nav className="nav-links">
          {[
            ["home", "Home"],
            ["dashboard", "Dashboard"],
            ["agent", "Agent"],
          ].map(([view, label]) => (
            <a
              key={view}
              href="#"
              className={activeView === view ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                handleNav(view);
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="topbar-right">
          <button className="btn-run" onClick={() => handleNav("agent")}>
            ↗ Run query
          </button>
          <button
            className="btn-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`ham-bar${menuOpen ? " open" : ""}`}></span>
            <span className={`ham-bar${menuOpen ? " open" : ""}`}></span>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu">
          {[
            ["home", "Home"],
            ["dashboard", "Dashboard"],
            ["agent", "Agent"],
          ].map(([view, label]) => (
            <a
              key={view}
              href="#"
              className={`mobile-menu-item${activeView === view ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNav(view);
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export default Nav;
