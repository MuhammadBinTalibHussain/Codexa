import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import snippetService from "../services/snippetService";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSpinner from "../components/LoadingSpinner";
import { ALLOWED_LANGUAGES } from "../constants/languages";

// Single form component that handles both creating a new snippet
// (no :id in the URL) and editing an existing one (/snippets/:id/edit).
const SnippetForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", code: "", language: "javascript" });
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;
    const loadSnippet = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await snippetService.getById(id);
        setForm({ title: data.title, code: data.code, language: data.language });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load snippet");
      } finally {
        setLoading(false);
      }
    };
    loadSnippet();
  }, [id, isEditMode]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError("Title is required");
    if (form.title.length > 120) return setError("Title must be at most 120 characters");
    if (!form.code.trim()) return setError("Code is required");

    setSubmitting(true);
    try {
      if (isEditMode) {
        await snippetService.update(id, form);
        navigate(`/snippets/${id}`);
      } else {
        const { data } = await snippetService.create(form);
        navigate(`/snippets/${data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save snippet");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading snippet..." />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {isEditMode ? "Edit snippet" : "Share a new snippet"}
      </h1>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Debounce function"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Language
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {ALLOWED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Code
          <textarea
            name="code"
            required
            rows={12}
            value={form.code}
            onChange={handleChange}
            placeholder="Paste your code here..."
            className="scroll-thin rounded-lg border border-gray-300 bg-gray-900 px-3 py-2 font-mono text-sm text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-black"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {submitting ? "Saving..." : isEditMode ? "Save changes" : "Publish snippet"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SnippetForm;
