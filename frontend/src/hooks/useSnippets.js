import { useState, useEffect, useCallback } from "react";
import snippetService from "../services/snippetService";

const useSnippets = (userId) => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = userId
        ? await snippetService.getByUser(userId)
        : await snippetService.getAll();
      setSnippets(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load snippets");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  return { snippets, loading, error, refetch: fetchSnippets };
};

export default useSnippets;