import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import analyticsService from "../services/analyticsService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const BRAND = "#9333ea"; // matches the app's brand-600 accent used elsewhere
const PIE_COLORS = ["#9333ea", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

const formatWeek = (isoDate) =>
  new Date(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const MetricCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

const ChartCard = ({ title, children, empty }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
    <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
    {empty ? (
      <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Not enough data yet.</p>
    ) : (
      <div className="h-64">{children}</div>
    )}
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: analytics } = await analyticsService.getAdmin();
      setData(analytics);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Loading analytics..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }
  if (!data) return null;

  const registrations = data.registrationsByWeek.map((r) => ({ ...r, label: formatWeek(r.week) }));
  const scoreTrend = data.aiScoreTrend.map((r) => ({ ...r, label: formatWeek(r.week) }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Analytics</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total users" value={data.totals.users} />
        <MetricCard label="Total snippets" value={data.totals.snippets} />
        <MetricCard label="Total reviews" value={data.totals.reviews} />
        <MetricCard label="AI reports generated" value={data.totals.aiReports} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="New user registrations (last 12 weeks)" empty={registrations.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrations}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="New users" stroke={BRAND} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform-wide average AI score (last 12 weeks)" empty={scoreTrend.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="averageScore" name="Avg score" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most active users (by snippets submitted)" empty={data.mostActiveUsers.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.mostActiveUsers} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="username" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="snippetCount" name="Snippets" fill={BRAND} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top users share" empty={data.mostActiveUsers.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.mostActiveUsers}
                dataKey="snippetCount"
                nameKey="username"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ username }) => username}
              >
                {data.mostActiveUsers.map((entry, i) => (
                  <Cell key={entry.userId} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminAnalytics;
