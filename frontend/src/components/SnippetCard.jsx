import { Link } from "react-router-dom";

const SnippetCard = ({ snippet }) => (
  <Link
    to={`/snippets/${snippet._id}`}
    className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
  >
    <div className="mb-2 flex items-center justify-between">
      <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">{snippet.title}</h3>
      <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
        {snippet.language}
      </span>
    </div>
    <pre className="scroll-thin mb-3 max-h-24 overflow-hidden rounded-lg bg-gray-900 p-3 text-xs text-gray-100 dark:bg-black">
      <code>{snippet.code?.slice(0, 200)}</code>
    </pre>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      by {snippet.author?.username || "unknown"} · {new Date(snippet.createdAt).toLocaleDateString()}
    </p>
  </Link>
);

export default SnippetCard;
