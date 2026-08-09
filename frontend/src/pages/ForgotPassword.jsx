import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import ErrorBanner from "../components/ErrorBanner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      // Always show the same success state whether or not the email
      // exists — matches the backend's intentionally generic response,
      // so this form can't be used to check which emails are registered.
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80svh] max-w-md flex-col justify-center px-4">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot your password?</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Enter your email and we'll send you a link to reset it.
      </p>

      {sent ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox
          (and spam folder) — the link expires in 15 minutes.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Remembered it?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
