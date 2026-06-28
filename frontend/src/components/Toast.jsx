import { useEffect } from "react";
import { useApp } from "../context/AppContext";

/**
 * Toast notification container — renders all active toasts.
 * Toasts are managed via AppContext.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    // Accessibility: announce to screen readers
    const el = document.getElementById(`toast-${toast.id}`);
    if (el) el.setAttribute("aria-live", "polite");
  }, [toast.id]);

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };

  return (
    <div
      id={`toast-${toast.id}`}
      className={`toast toast-${toast.type}`}
      role="alert"
    >
      <span className="toast-icon">{icons[toast.type] ?? "ℹ️"}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        ✕
      </button>
    </div>
  );
}

export default ToastContainer;
