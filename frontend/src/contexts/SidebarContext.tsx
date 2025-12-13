import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DashboardSidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  isDesktop: boolean;
}

const DashboardSidebarContext = createContext<DashboardSidebarContextType | undefined>(undefined);

export const useDashboardSidebar = () => {
  const context = useContext(DashboardSidebarContext);
  if (!context) {
    throw new Error("useDashboardSidebar must be used within a DashboardSidebarProvider");
  }
  return context;
};

interface DashboardSidebarProviderProps {
  children: ReactNode;
}

export const DashboardSidebarProvider = ({ children }: DashboardSidebarProviderProps) => {
  // Initialize with collapsed state (true by default), load from localStorage if available
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('dashboard-sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : true; // Default to collapsed
  });

  // Track desktop state to prevent animation glitches during navigation
  const [isDesktop, setIsDesktop] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  // Save to localStorage whenever collapsed state changes
  useEffect(() => {
    localStorage.setItem('dashboard-sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Handle desktop detection with debouncing
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Initial check
    checkIsDesktop();
    
    // Add resize listener with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIsDesktop, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <DashboardSidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed, isDesktop }}>
      {children}
    </DashboardSidebarContext.Provider>
  );
};