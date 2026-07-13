const ReviewCard = ({ review, onMarkHelpful }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <div className="mb-1 flex items-center justify-between">
      <span className="font-medium text-gray-900">{review.reviewer?.username || "Anonymous"}</span>
      <span className="text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
    </div>
    <p className="mb-3 text-sm text-gray-600">{review.comment}</p>
    <button
      type="button"
      onClick={() => onMarkHelpful?.(review._id)}
      className="text-xs font-medium text-brand-600 hover:text-brand-700"
    >
      👍 Helpful ({review.helpfulVotes ?? 0})
    </button>
  </div>
);

export default ReviewCard;