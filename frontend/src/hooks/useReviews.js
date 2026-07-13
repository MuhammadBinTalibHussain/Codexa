import { useState, useEffect, useCallback } from "react";
import reviewService from "../services/reviewService";

const useReviews = (snippetId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!snippetId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await reviewService.getForSnippet(snippetId);
      setReviews(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [snippetId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
};

export default useReviews;