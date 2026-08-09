import getPasswordStrength from "../utils/passwordStrength";

const PasswordStrengthMeter = ({ password }) => {
  const { score, label, color, suggestions } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= score ? color : "bg-gray-200 dark:bg-gray-700"}`}
          />
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      {suggestions.length > 0 && (
        <ul className="mt-1 list-inside list-disc text-xs text-gray-500 dark:text-gray-400">
          {suggestions.map((s) => <li key={s}>{s}</li>)}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
