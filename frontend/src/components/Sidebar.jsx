import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Overview", icon: "📊" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const Sidebar = () => (
  <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 sm:block">
    <nav className="flex flex-col gap-1 p-4">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              isActive
                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            }`
          }
        >
          <span>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
