// Lightweight password strength scorer — no external dependency needed.
// Returns a score 0-4 plus a label/color for the UI, and a list of concrete
// suggestions for what's missing so the user knows exactly how to improve it.
const RULES = [
  { test: (pw) => pw.length >= 8, message: "Use at least 8 characters" },
  { test: (pw) => /[a-z]/.test(pw), message: "Add a lowercase letter" },
  { test: (pw) => /[A-Z]/.test(pw), message: "Add an uppercase letter" },
  { test: (pw) => /[0-9]/.test(pw), message: "Add a number" },
  { test: (pw) => /[^A-Za-z0-9]/.test(pw), message: "Add a symbol (e.g. ! @ # $)" },
];

const LEVELS = [
  { label: "Very weak", color: "bg-red-500" },
  { label: "Weak", color: "bg-red-400" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-lime-500" },
  { label: "Strong", color: "bg-emerald-500" },
];

const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: "", color: "bg-gray-200 dark:bg-gray-700", suggestions: [] };
  }

  const passed = RULES.filter((rule) => rule.test(password));
  const suggestions = RULES.filter((rule) => !rule.test(password)).map((rule) => rule.message);

  // Extra-long passwords get a small bonus even if they skip a category
  // (a 16-char passphrase is genuinely strong even without symbols).
  let score = passed.length;
  if (password.length >= 12 && score < 4) score += 1;
  score = Math.min(score, 4);

  return { score, ...LEVELS[score], suggestions };
};

export default getPasswordStrength;
