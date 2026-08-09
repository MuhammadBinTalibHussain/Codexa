import { useState, useEffect, useCallback } from "react";
import snippetService from "../services/snippetService";

// Used for a single user's own snippets (Profile page) — always a flat
// array, since one user's submissions are naturally a small, bounded list.
const useSnippets = (userId) => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (userId) {
        const { data } = await snippetService.getByUser(userId);
        setSnippets(data);
      } else {
        // Falls back to page 1 of the paginated endpoint, unwrapped to a
        // flat array, for any caller that just wants "some snippets" and
        // doesn't care about pagination controls.
        const { data } = await snippetService.getAll();
        setSnippets(data.snippets);
      }
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
