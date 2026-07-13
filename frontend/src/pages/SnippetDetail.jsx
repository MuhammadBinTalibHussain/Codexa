import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import useAuth from "../hooks/useAuth";
import useReviews from "../hooks/useReviews";
import useLiveComments from "../hooks/useLiveComments";
import snippetService from "../services/snippetService";
import reviewService from "../services/reviewService";
import reportService from "../services/reportService";
import ReviewCard from "../components/ReviewCard";
import ScoreBar from "../components/ScoreBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const SnippetDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [snippet, setSnippet] = useState(null);
  const [snippetLoading, setSnippetLoading] = useState(true);
  const [snippetError, setSnippetError] = useState(null);

  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);

  const { reviews, loading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useReviews(id);
  const { comments, connected, sendComment } = useLiveComments(id, user?.username);

  const [reviewForm, setReviewForm] = useState({ comment: "", rating: 5 });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFormError, setReviewFormError] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    const load = async () => {
      setSnippetLoading(true);
      setSnippetError(null);
      try {
        const { data } = await snippetService.getById(id);
        setSnippet(data);
      } catch (err) {
        setSnippetError(err.response?.data?.message || "Failed to load snippet");
      } finally {
        setSnippetLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadReport = async () => {
      setReportLoading(true);
      try {
        const { data } = await reportService.getForSnippet(id);
        setReport(data);
      } catch {
        setReport(null);
      } finally {
        setReportLoading(false);
      }
    };
    loadReport();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewFormError(null);
    if (reviewForm.comment.trim().length < 10) {
      setReviewFormError("Comment must be at least 10 characters long");
      return;
    }
    setReviewSubmitting(true);
    try {
      await reviewService.create({
        snippetId: id,
        comment: reviewForm.comment.trim(),
        rating: Number(reviewForm.rating),
      });
      setReviewForm({ comment: "", rating: 5 });
      refetchReviews();
    } catch (err) {
      setReviewFormError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewService.markHelpful(reviewId);
      refetchReviews();
    } catch {
      // non-critical, silently ignore
    }
  };

  if (snippetLoading) return <LoadingSpinner label="Loading snippet..." />;
  if (snippetError) return <div className="mx-auto max-w-3xl px-4 py-8"><ErrorBanner message={snippetError} /></div>;
  if (!snippet) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{snippet.title}</h1>
        <p className="text-sm text-gray-500">
          {snippet.language} · by {snippet.author?.username} · {new Date(snippet.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="scroll-thin mb-6 overflow-x-auto rounded-xl border border-gray-200">
            <SyntaxHighlighter language={snippet.language} style={oneDark} customStyle={{ margin: 0 }}>
              {snippet.code}
            </SyntaxHighlighter>
          </div>

          <h2 className="mb-3 text-lg font-semibold text-gray-900">Reviews</h2>
          {reviewsLoading && <LoadingSpinner label="Loading reviews..." />}
          {reviewsError && <ErrorBanner message={reviewsError} onRetry={refetchReviews} />}
          {!reviewsLoading && !reviewsError && (
            <div className="mb-6 flex flex-col gap-3">
              {reviews.map((r) => <ReviewCard key={r._id} review={r} onMarkHelpful={handleMarkHelpful} />)}
              {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
            </div>
          )}

          {user && (
            <form onSubmit={handleReviewSubmit} className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 font-medium text-gray-900">Leave a review</h3>
              {reviewFormError && <div className="mb-3"><ErrorBanner message={reviewFormError} /></div>}
              <label className="mb-3 flex flex-col gap-1 text-sm font-medium text-gray-700">
                Comment
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="At least 10 characters..."
                  rows={3}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                Rating
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: e.target.value }))}
                  className="rounded-md border border-gray-300 px-2 py-1"
                >
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
                </select>
              </label>
              <button
                type="submit" disabled={reviewSubmitting}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {reviewSubmitting ? "Submitting..." : "Submit review"}
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">AI Report</h2>
            {reportLoading && <LoadingSpinner label="Checking for a report..." />}
            {!reportLoading && !report && (
              <p className="text-sm text-gray-500">No AI report has been generated for this snippet yet.</p>
            )}
            {!reportLoading && report && (
              <div className="flex flex-col gap-3">
                <ScoreBar label="Readability" value={report.readability} />
                <ScoreBar label="Maintainability" value={report.maintainability} />
                <ScoreBar label="Performance" value={report.performance} />
                <ScoreBar label="Overall" value={report.overall} />
                {report.suggestions?.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                    {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Live comments</h2>
              <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-300"}`} title={connected ? "Connected" : "Disconnected"} />
            </div>
            <div className="scroll-thin mb-3 max-h-64 overflow-y-auto">
              {comments.map((c, i) => (
                <div key={i} className="mb-2 text-sm">
                  <span className="font-medium text-gray-800">{c.author}: </span>
                  <span className="text-gray-600">{c.text}</span>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-gray-500">No live comments yet.</p>}
            </div>
            {user && (
              <div className="flex gap-2">
                <input
                  type="text" value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commentDraft.trim()) {
                      sendComment(commentDraft);
                      setCommentDraft("");
                    }
                  }}
                  placeholder="Say something..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                <button
                  type="button"
                  onClick={() => { if (commentDraft.trim()) { sendComment(commentDraft); setCommentDraft(""); } }}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;