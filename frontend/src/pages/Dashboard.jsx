import { useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useSnippets from "../hooks/useSnippets";
import usePaginatedSnippets from "../hooks/usePaginatedSnippets";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const PAGE_SIZE = 5;

const Dashboard = () => {
  const { user } = useAuth();

  // Personal stat cards: the user's own snippets, each already enriched by
  // the backend with reviewCount/hasReport/aiScore — no extra per-snippet
  // requests needed (this used to be an N+1 network call pattern).
  const { snippets: ownSnippets, loading: ownLoading, error: ownError } = useSnippets(user?.id);

  // "All snippets" table: paginated + enriched the same way, so this stays
  // fast no matter how many snippets exist platform-wide.
  const {
    snippets: pageSnippets, page, setPage, totalPages, loading, error, refetch,
  } = usePaginatedSnippets(PAGE_SIZE);

  const totalSnippets = ownSnippets.length;
  const totalReviews = ownSnippets.reduce((sum, s) => sum + (s.reviewCount ?? 0), 0);
  const avgScore = useMemo(() => {
    const scores = ownSnippets.filter((s) => s.hasReport && typeof s.aiScore === "number").map((s) => s.aiScore);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [ownSnippets]);

  return (
    <div className="flex">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.username}
        </h1>

        {ownLoading && <LoadingSpinner label="Loading your dashboard..." />}
        {ownError && <ErrorBanner message={ownError} />}

        {!ownLoading && !ownError && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Snippets submitted" value={totalSnippets} />
            <MetricCard label="Reviews received" value={totalReviews} />
            <MetricCard
              label="Average AI score"
              value={avgScore !== null ? `${avgScore}/100` : "No reports yet"}
            />
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All snippets</h2>
        </div>

        {loading && <LoadingSpinner label="Loading snippets..." />}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {!loading && !error && (
          <>
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
                          <StatusBadge reviewCount={s.reviewCount} hasReport={s.hasReport} />
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
