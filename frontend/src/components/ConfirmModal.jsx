import Modal from "./Modal";

// A focused confirmation dialog for destructive actions (delete snippet,
// delete review, etc). Wraps the existing generic Modal so styling stays
// consistent with the rest of the app.
const ConfirmModal = ({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 ${
            danger
              ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              : "bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          }`}
        >
          {loading ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
