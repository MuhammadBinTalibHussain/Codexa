import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useSnippets from "../hooks/useSnippets";
import reviewService from "../services/reviewService";
import reportService from "../services/reportService";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const PAGE_SIZE = 5;

const Dashboard = () => {
  const { user } = useAuth();
  // Fetch ALL snippets (no userId passed) so every user's snippets show up here.
  // Ownership-based editing is enforced separately (and already correctly) on
  // the snippet detail page, so showing everyone's snippets here is safe.
  const { snippets, loading, error, refetch } = useSnippets();

  const [reviewsBySnippet, setReviewsBySnippet] = useState({});
  const [reportsBySnippet, setReportsBySnippet] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(true);

  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (snippets.length === 0) {
      setDetailsLoading(false);
      return;
    }

    let cancelled = false;
    setDetailsLoading(true);

    const loadDetails = async () => {
      const reviewEntries = await Promise.all(
        snippets.map(async (s) => {
          try {
            const { data } = await reviewService.getForSnippet(s._id);
            return [s._id, data];
          } catch {
            return [s._id, []];
          }
        })
      );

      const reportEntries = await Promise.all(
        snippets.map(async (s) => {
          try {
            const { data } = await reportService.getForSnippet(s._id);
            return [s._id, data];
          } catch {
            return [s._id, null];
          }
        })
      );

      if (!cancelled) {
        setReviewsBySnippet(Object.fromEntries(reviewEntries));
        setReportsBySnippet(Object.fromEntries(reportEntries));
        setDetailsLoading(false);
      }
    };

    loadDetails();
    return () => { cancelled = true; };
  }, [snippets]);

  // Snippets belonging to the logged-in user — used for the personal stat
  // cards, so those numbers still reflect "your" activity even though the
  // table below now lists everyone's snippets.
  const ownSnippets = useMemo(
    () => snippets.filter((s) => s.author?._id === user?.id),
    [snippets, user?.id]
  );

  const totalSnippets = ownSnippets.length;
  const totalReviews = ownSnippets.reduce(
    (sum, s) => sum + (reviewsBySnippet[s._id]?.length ?? 0),
    0
  );
  const avgScore = useMemo(() => {
    const scores = ownSnippets
      .map((s) => reportsBySnippet[s._id])
      .filter(Boolean)
      .map((r) => r.overall);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [ownSnippets, reportsBySnippet]);

  const recentActivity = useMemo(() => {
    const ownIds = new Set(ownSnippets.map((s) => s._id));
    const all = Object.entries(reviewsBySnippet)
      .filter(([snippetId]) => ownIds.has(snippetId))
      .flatMap(([snippetId, reviews]) =>
        reviews.map((r) => ({ ...r, snippetId, snippetTitle: snippets.find((s) => s._id === snippetId)?.title }))
      );
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [reviewsBySnippet, snippets, ownSnippets]);

  const sortedSnippets = useMemo(() => {
    const copy = [...snippets];
    if (sortBy === "newest") copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest") copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "title") copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy;
  }, [snippets, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedSnippets.length / PAGE_SIZE));
  const pageSnippets = sortedSnippets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.username}
        </h1>

        {loading && <LoadingSpinner label="Loading your dashboard..." />}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard label="Snippets submitted" value={totalSnippets} />
              <MetricCard label="Reviews received" value={detailsLoading ? "…" : totalReviews} />
              <MetricCard
                label="Average AI score"
                value={detailsLoading ? "…" : avgScore !== null ? `${avgScore}/100` : "No reports yet"}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All snippets</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-2">Title</th>
                        <th className="hidden px-4 py-2 sm:table-cell">Language</th>
                        <th className="hidden px-4 py-2 sm:table-cell">Author</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="dark:bg-gray-950">
                      {pageSnippets.map((s) => {
                        const reviewCount = reviewsBySnippet[s._id]?.length ?? 0;
                        const hasReport = Boolean(reportsBySnippet[s._id]);
                        const isOwn = s.author?._id === user?.id;
                        return (
                          <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
                            <td className="px-4 py-2">
                              <Link
                                to={`/snippets/${s._id}`}
                                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                              >
                                {s.title}
                              </Link>
                              {isOwn && (
                                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                                  Yours
                                </span>
                              )}
                            </td>
                            <td className="hidden px-4 py-2 text-gray-500 dark:text-gray-400 sm:table-cell">
                              {s.language}
                            </td>
                            <td className="hidden px-4 py-2 text-gray-500 dark:text-gray-400 sm:table-cell">
                              {s.author?.username || "unknown"}
                            </td>
                            <td className="px-4 py-2">
                              <StatusBadge reviewCount={reviewCount} hasReport={hasReport} />
                            </td>
                          </tr>
                        );
                      })}
                      {pageSnippets.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                            No snippets have been submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-3 text-sm">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-md border border-gray-300 px-2 py-1 disabled:opacity-40 dark:border-gray-600"
                    >
                      Prev
                    </button>
                    <span className="text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
                    <button
                      type="button"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-md border border-gray-300 px-2 py-1 disabled:opacity-40 dark:border-gray-600"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Recent activity</h2>
                <div className="flex flex-col gap-3">
                  {recentActivity.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{item.reviewer?.username || "Someone"}</span>{" "}
                        reviewed <span className="font-medium">{item.snippetTitle}</span>
                      </p>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">{item.comment}</p>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

const StatusBadge = ({ reviewCount, hasReport }) => {
  if (hasReport) {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        Analyzed
      </span>
    );
  }
  if (reviewCount > 0) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        Reviewed
      </span>
    );
  }
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
      Pending
    </span>
  );
};

export default Dashboard;
