// Single peer review row: rating, comment, like/dislike buttons.
const ReviewCard = ({ review, onMarkHelpful, onMarkUnhelpful, currentUserId }) => {
  const myVote = currentUserId
    ? review.voters?.find((v) => v.user === currentUserId || v.user?._id === currentUserId)?.vote
    : null;
  const isHelpfulActive = myVote === "helpful";
  const isUnhelpfulActive = myVote === "unhelpful";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {review.reviewer?.username || "Anonymous"}
        </span>
        <span className="text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
      </div>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onMarkHelpful?.(review._id)}
          className={`rounded-full px-2 py-1 text-xs font-medium transition ${
            isHelpfulActive
              ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"
              : "text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          }`}
        >
          👍 Helpful ({review.helpfulVotes ?? 0})
        </button>
        <button
          type="button"
          onClick={() => onMarkUnhelpful?.(review._id)}
          className={`rounded-full px-2 py-1 text-xs font-medium transition ${
            isUnhelpfulActive
              ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
              : "text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          }`}
        >
          👎 Dislike ({review.unhelpfulVotes ?? 0})
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
