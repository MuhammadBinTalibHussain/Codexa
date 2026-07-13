import { useState } from "react";
import useAuth from "../hooks/useAuth";
import useSnippets from "../hooks/useSnippets";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

// Display-name editing is local-only for now (no PATCH /api/auth/me
// endpoint exists yet on the backend); clearly not persisted server-side.
const Profile = () => {
  const { user } = useAuth();
  const { snippets, loading, error, refetch } = useSnippets(user?.id);
  const [displayName, setDisplayName] = useState(user?.username || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Your profile</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-1">
            <h2 className="mb-3 font-semibold text-gray-900">Account</h2>
            <dl className="mb-4 flex flex-col gap-2 text-sm">
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-800">{user?.email}</dd></div>
              <div><dt className="text-gray-500">Role</dt><dd className="font-medium text-gray-800 capitalize">{user?.role}</dd></div>
            </dl>

            <form onSubmit={handleSave} className="flex flex-col gap-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Display name
                <input
                  type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <button type="submit" className="rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                {saved ? "Saved!" : "Save"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 font-semibold text-gray-900">Your submissions ({snippets.length})</h2>
            {loading && <LoadingSpinner label="Loading your snippets..." />}
            {error && <ErrorBanner message={error} onRetry={refetch} />}
            {!loading && !error && (
              <ul className="flex flex-col gap-2">
                {snippets.map((s) => (
                  <li key={s._id} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm">
                    <span className="font-medium text-gray-800">{s.title}</span>{" "}
                    <span className="text-gray-500">— {s.language}</span>
                  </li>
                ))}
                {snippets.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;