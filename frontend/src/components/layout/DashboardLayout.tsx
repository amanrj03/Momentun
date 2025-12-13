import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { motion, Transition } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "./ProtectedRoute";
import { useDashboardSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardContent = ({ children }: DashboardLayoutProps) => {
  const { collapsed, isDesktop } = useDashboardSidebar();

  // Shared animation configuration for perfect synchronization
  const sharedTransition: Transition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    type: "tween"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-hero-pattern opacity-50 pointer-events-none" />
      
      <Sidebar sharedTransition={sharedTransition} />
      <motion.main
        initial={false} // Prevent initial animation on mount
        animate={{
          marginLeft: isDesktop ? (collapsed ? 72 : 260) : 0
        }}
        transition={sharedTransition}
        className="min-h-screen relative"
        style={{ 
          willChange: 'margin-left',
          // Ensure consistent layout during navigation
          marginLeft: isDesktop ? (collapsed ? 72 : 260) : 0
        }}
      >
        {children || <Outlet />}
      </motion.main>
    </div>
  );
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute>
      <DashboardContent>{children}</DashboardContent>
    </ProtectedRoute>
  );
};

export default DashboardLayout;