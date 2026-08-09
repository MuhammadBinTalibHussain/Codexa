import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import authService from "../services/authService";
import ErrorBanner from "../components/ErrorBanner";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import PasswordInput from "../components/PasswordInput";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      const data = await authService.resetPassword(token, password);
      // Reset link is single-use and already proved identity, so log the
      // person straight in instead of making them log in again right after.
      setSession(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "This reset link is invalid or has expired.");
      setPassword("");
      setConfirmPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80svh] max-w-md flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Set a new password</h1>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          New password
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthMeter password={password} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm new password
          <PasswordInput
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {submitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
