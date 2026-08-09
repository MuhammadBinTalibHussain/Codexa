import usePaginatedSnippets from "../hooks/usePaginatedSnippets";
import SnippetCard from "../components/SnippetCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const PAGE_SIZE = 12;

// Public landing page: browse every snippet from every user, no auth required.
// Paginated on the backend so this stays fast regardless of how many
// snippets exist — it no longer loads the entire collection at once.
const Home = () => {
  const { snippets, page, setPage, totalPages, totalCount, loading, error, refetch } =
    usePaginatedSnippets(PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Latest Snippets</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Browse code shared by the Codexa community{totalCount > 0 ? ` (${totalCount} total)` : ""}.
        </p>
      </div>

      {loading && <LoadingSpinner label="Loading snippets..." />}
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet) => <SnippetCard key={snippet._id} snippet={snippet} />)}
            {snippets.length === 0 && (
              <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">
                No snippets yet — be the first to share one.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-600"
              >
                Prev
              </button>
              <span className="text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-600"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
