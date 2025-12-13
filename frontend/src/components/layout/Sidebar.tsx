import { NavLink, useLocation } from "react-router-dom";
import { motion, Transition } from "framer-motion";
import {
  LayoutDashboard,
  Video,
  BarChart3,
  Settings,
  Upload,
  Menu,
  X,
  History,
  Heart,
  Bookmark,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardSidebar } from "@/contexts/SidebarContext";

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed?: boolean;
}

const NavItem = ({ to, icon: Icon, label, collapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
        "hover:bg-secondary/80 group relative",
        isActive
          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5 flex-shrink-0 transition-all duration-300",
          isActive ? "text-primary" : "group-hover:text-foreground"
        )}
      />
      {!collapsed && (
        <span className="font-medium text-sm truncate">{label}</span>
      )}
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-l-full" />
      )}
    </NavLink>
  );
};

interface SidebarProps {
  className?: string;
  sharedTransition?: Transition;
}

export const Sidebar = ({ className, sharedTransition }: SidebarProps) => {
  const { collapsed, toggleCollapsed } = useDashboardSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const getNavItems = () => {
    if (user?.role === "VIEWER") {
      return [
        { to: "/dashboard", icon: LayoutDashboard, label: "Discover" },
        { to: "/watch-history", icon: History, label: "Watch History" },
        { to: "/liked-videos", icon: Heart, label: "Liked Videos" },
        { to: "/saved-videos", icon: Bookmark, label: "Saved Videos" },
        { to: "/settings", icon: Settings, label: "Settings" },
      ];
    } else if (user?.role === "CREATOR") {
      return [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/content", icon: Video, label: "My Videos" },
        { to: "/analytics", icon: BarChart3, label: "Analytics" },
        { to: "/settings", icon: Settings, label: "Settings" },
      ];
    } else if (user?.role === "ADMIN") {
      return [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/content", icon: Video, label: "Content" },
        { to: "/analytics", icon: BarChart3, label: "Analytics" },
        { to: "/settings", icon: Settings, label: "Settings" },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false} // Prevent initial animation on mount
        animate={{
          width: collapsed ? 72 : 260
        }}
        transition={sharedTransition || {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
          type: "tween"
        }}
        className={cn(
          "fixed left-0 top-0 h-full bg-card/50 backdrop-blur-xl border-r border-border/50 z-40",
          "flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        style={{ 
          willChange: 'width',
          // Ensure consistent width during navigation
          width: collapsed ? 72 : 260
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border/50">
          <div className="flex items-center justify-center w-full">
            {!collapsed ? (
              <img 
                src="/fullLogo.png" 
                alt="Momentum" 
                className="h-8 w-auto object-contain"
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="Momentum" 
                className="h-8 w-auto object-contain"
              />
            )}
          </div>
        </div>

        {/* Upload Button - Only for Creators and Admins */}
        {!isLoading && user && (user.role === "CREATOR" || user.role === "ADMIN") && (
          <div className="p-4">
            <NavLink to="/upload">
              <Button
                className={cn(
                  "w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5",
                  collapsed ? "px-2" : ""
                )}
              >
                <Upload className="w-4 h-4" />
                {!collapsed && <span className="ml-2">Upload Video</span>}
              </Button>
            </NavLink>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse Toggle - Desktop only */}
        <div className="hidden lg:block p-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl"
            onClick={toggleCollapsed}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;