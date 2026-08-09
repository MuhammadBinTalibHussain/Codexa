import { useState, useEffect, useCallback } from "react";
import snippetService from "../services/snippetService";

// Full pagination controls for the "browse all snippets" views (Explore,
// Dashboard's snippet table). Each snippet already arrives enriched with
// reviewCount/hasReport/aiScore from the backend, so no extra per-snippet
// requests are needed here.
const usePaginatedSnippets = (limit = 12) => {
  const [snippets, setSnippets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await snippetService.getAll(page, limit);
      setSnippets(data.snippets);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load snippets");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { snippets, page, setPage, totalPages, totalCount, loading, error, refetch: fetchPage };
};

export default usePaginatedSnippets;
