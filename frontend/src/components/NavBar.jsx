import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

// Top navigation bar. Collapses into a hamburger menu below the `sm`
// breakpoint per the Week 4 responsive-design spec (mobile < 640px).
const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = user
    ? [
        { to: "/explore", label: "Explore" },
        { to: "/snippets/new", label: "New Snippet" },
        { to: "/dashboard", label: "Dashboard" },
        { to: "/profile", label: "Profile" },
        ...(user.role === "admin" ? [{ to: "/admin/analytics", label: "Analytics" }] : []),
      ]
    : [
        { to: "/explore", label: "Explore" },
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-600 dark:text-brand-400">
          Codexa
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <NotificationBell enabled={Boolean(user)} />
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <NotificationBell enabled={Boolean(user)} />
          <button
            type="button"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-200 px-4 py-2 dark:border-gray-800 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 rounded-md bg-brand-600 px-3 py-2 text-left text-sm font-medium text-white dark:bg-brand-500"
            >
              Logout
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

export default NavBar;
