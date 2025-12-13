import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import CreatorDashboard from "@/components/dashboard/CreatorDashboard";
import ViewerDashboard from "@/components/dashboard/ViewerDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case "ADMIN":
      // Admin dashboard without sidebar
      return <AdminDashboard />;
    case "CREATOR":
      // Creator dashboard with sidebar
      return (
        <DashboardLayout>
          <CreatorDashboard />
        </DashboardLayout>
      );
    case "VIEWER":
      // Viewer dashboard with sidebar
      return (
        <DashboardLayout>
          <ViewerDashboard />
        </DashboardLayout>
      );
    default:
      // Default fallback with sidebar
      return (
        <DashboardLayout>
          <ViewerDashboard />
        </DashboardLayout>
      );
  }
};

export default Dashboard;
