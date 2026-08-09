import { useState } from "react";
import useAuth from "../hooks/useAuth";
import useSnippets from "../hooks/useSnippets";
import useToast from "../hooks/useToast";
import authService from "../services/authService";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import PasswordInput from "../components/PasswordInput";

// Display-name editing is local-only for now (no PATCH /api/auth/me
// endpoint exists yet on the backend); clearly not persisted server-side.
const Profile = () => {
  const { user } = useAuth();
  const { snippets, loading, error, refetch } = useSnippets(user?.id);
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.username || "");
  const [saved, setSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showToast("Password changed successfully", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
      setPasswordForm((f) => ({ ...f, currentPassword: "" }));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Your profile</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Account</h2>
              <dl className="mb-4 flex flex-col gap-2 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="font-medium text-gray-800 dark:text-gray-200">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Role</dt>
                  <dd className="font-medium capitalize text-gray-800 dark:text-gray-200">{user?.role}</dd>
                </div>
              </dl>

              <form onSubmit={handleSave} className="flex flex-col gap-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display name
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  {saved ? "Saved!" : "Save"}
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Change password</h2>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                {passwordError && <ErrorBanner message={passwordError} />}
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current password
                  <PasswordInput
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  New password
                  <PasswordInput
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  />
                  <PasswordStrengthMeter password={passwordForm.newPassword} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm new password
                  <PasswordInput
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                </label>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  {changingPassword ? "Changing..." : "Change password"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
              Your submissions ({snippets.length})
            </h2>
            {loading && <LoadingSpinner label="Loading your snippets..." />}
            {error && <ErrorBanner message={error} onRetry={refetch} />}
            {!loading && !error && (
              <ul className="flex flex-col gap-2">
                {snippets.map((s) => (
                  <li
                    key={s._id}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{s.title}</span>{" "}
                    <span className="text-gray-500 dark:text-gray-400">— {s.language}</span>
                  </li>
                ))}
                {snippets.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No submissions yet.</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
