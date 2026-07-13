import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = user
    ? [{ to: "/dashboard", label: "Dashboard" }, { to: "/profile", label: "Profile" }]
    : [{ to: "/login", label: "Login" }, { to: "/register", label: "Register" }];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-600">CodePulse</Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm font-medium text-gray-600 hover:text-brand-600">
              {link.label}
            </Link>
          ))}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Logout
            </button>
          )}
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-200 px-4 py-2 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 rounded-md bg-brand-600 px-3 py-2 text-left text-sm font-medium text-white"
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