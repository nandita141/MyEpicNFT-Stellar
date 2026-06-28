import { createContext, useContext, useState, useCallback, useRef } from "react";

const AppContext = createContext(null);

/**
 * Global application context provider.
 * Manages wallet state, toasts, and contract client ref.
 */
export function AppProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [yourCards, setYourCards] = useState("-");
  const [theme, setTheme] = useState("dark");
  const [toasts, setToasts] = useState([]);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toastIdRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Add a toast notification. type: 'success' | 'error' | 'info' | 'warning' */
  const addToast = useCallback((message, type = "info", duration = 5000) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = {
    walletAddress, setWalletAddress,
    contract, setContract,
    totalSupply, setTotalSupply,
    yourCards, setYourCards,
    theme, toggleTheme,
    toasts, addToast, removeToast,
    activeMenu, setActiveMenu,
    sidebarOpen, setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook to consume global app context */
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
