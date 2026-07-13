const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-brand-600">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default LoadingSpinner;