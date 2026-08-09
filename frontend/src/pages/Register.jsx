import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ErrorBanner from "../components/ErrorBanner";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import PasswordInput from "../components/PasswordInput";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try a different email/username.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80svh] max-w-md flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Create your account</h1>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Username
          <input
            type="text"
            name="username"
            required
            value={form.username}
            onChange={handleChange}
            placeholder="jane_dev"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
          <PasswordInput
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
          />
          <PasswordStrengthMeter password={form.password} />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
