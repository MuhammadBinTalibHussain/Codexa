import useSnippets from "../hooks/useSnippets";
import SnippetCard from "../components/SnippetCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const Home = () => {
  const { snippets, loading, error, refetch } = useSnippets();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Latest Snippets</h1>
        <p className="text-sm text-gray-500">Browse code shared by the CodePulse community.</p>
      </div>

      {loading && <LoadingSpinner label="Loading snippets..." />}
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snippets.map((snippet) => <SnippetCard key={snippet._id} snippet={snippet} />)}
          {snippets.length === 0 && (
            <p className="col-span-full text-sm text-gray-500">No snippets yet — be the first to share one.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;