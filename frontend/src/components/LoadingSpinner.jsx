/**
 * Reusable loading spinner component.
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} label - Accessible label
 */
export function LoadingSpinner({ size = "md", label = "Loading..." }) {
  return (
    <div className={`spinner spinner-${size}`} role="status" aria-label={label}>
      <div className="spinner-ring" />
    </div>
  );
}

/**
 * Full-page overlay loader with optional message.
 */
export function PageLoader({ message = "Processing transaction..." }) {
  return (
    <div className="loader-overlay" role="status">
      <div className="loader-inner">
        <LoadingSpinner size="lg" />
        <p className="loader-message">{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
