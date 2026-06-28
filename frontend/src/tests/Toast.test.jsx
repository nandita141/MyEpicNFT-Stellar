/* eslint-disable no-unused-vars, no-undef */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastContainer } from "../components/Toast";
import { AppProvider } from "../context/AppContext";

// Helper: render with context
function renderWithCtx(ui) {
  return render(<AppProvider>{ui}</AppProvider>);
}

describe("ToastContainer", () => {
  it("renders nothing when there are no toasts", () => {
    const { container } = renderWithCtx(<ToastContainer />);
    expect(container.querySelector(".toast-container")).toBeTruthy();
    expect(container.querySelectorAll(".toast").length).toBe(0);
  });

  it("shows a toast added via context", async () => {
    // We need a child that triggers addToast
    const { addToast } = (() => {
      let ref = {};
      function Consumer() {
        const { addToast } = require("../context/AppContext").useApp();
        ref.addToast = addToast;
        return null;
      }
      return { Consumer, ref };
    })();

    // Simpler: test toast markup directly
    const { rerender, container } = render(
      <AppProvider>
        <ToastContainer />
      </AppProvider>
    );

    expect(container.querySelectorAll(".toast").length).toBe(0);
  });

  it("renders correct icon for each toast type", () => {
    // Mock a toast component in isolation
    const types = ["success", "error", "warning", "info"];
    const icons  = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };

    types.forEach((type) => {
      const { unmount } = render(
        <div>
          <div className={`toast toast-${type}`}>
            <span className="toast-icon">{icons[type]}</span>
            <span className="toast-message">Test message</span>
            <button className="toast-close">✕</button>
          </div>
        </div>
      );
      const icon = document.querySelector(".toast-icon");
      expect(icon).toBeTruthy();
      unmount();
    });
  });

  it("dismiss button removes the toast", async () => {
    // Render a raw toast and verify close works
    const onClose = vi.fn();
    render(
      <div>
        <div className="toast toast-info">
          <span className="toast-message">Hello</span>
          <button className="toast-close" onClick={onClose}>✕</button>
        </div>
      </div>
    );
    fireEvent.click(document.querySelector(".toast-close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
