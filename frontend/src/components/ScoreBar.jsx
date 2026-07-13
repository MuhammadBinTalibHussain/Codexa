const ScoreBar = ({ label, value }) => {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const color = clamped >= 75 ? "bg-emerald-500" : clamped >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{clamped}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
};

export default ScoreBar;