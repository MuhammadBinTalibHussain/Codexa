import { useState } from "react";

// Custom-drawn SVG padlock icons: closed = password hidden, open = password
// visible. A lock metaphor fits a password field more directly than the
// common eye / crossed-eye pattern most apps default to.
const LockedIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

const UnlockedIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 7.5-1.9" />
    <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

// A password <input> with a show/hide toggle. Behaves like a normal
// controlled input — pass value/onChange/etc straight through.
const PasswordInput = ({ value, onChange, placeholder = "••••••••", className = "", ...rest }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${className}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        {visible ? <UnlockedIcon /> : <LockedIcon />}
      </button>
    </div>
  );
};

export default PasswordInput;
