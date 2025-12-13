import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ViewerProvider } from "@/contexts/ViewerContext";
import { DashboardSidebarProvider } from "@/contexts/SidebarContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Content from "./pages/Content";
import Analytics from "./pages/Analytics";

import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import RegisterViewer from "./pages/RegisterViewer";
import RegisterCreator from "./pages/RegisterCreator";

import WatchHistory from "./pages/WatchHistory";
import LikedVideos from "./pages/LikedVideos";
import SavedVideos from "./pages/SavedVideos";
import CreatorProfile from "./pages/CreatorProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ViewerProvider>
          <DashboardSidebarProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register/viewer" element={<RegisterViewer />} />
            <Route path="/register/creator" element={<RegisterCreator />} />

            {/* Admin Dashboard - No Sidebar */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Creator Profile - No Sidebar */}
            <Route path="/creator/:creatorId" element={<CreatorProfile />} />
            
            {/* Other Pages - With Sidebar for non-admin users */}
            <Route element={<DashboardLayout />}>
              <Route path="/content" element={
                <ProtectedRoute allowedRoles={["CREATOR", "ADMIN"]}>
                  <Content />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={["CREATOR", "ADMIN"]}>
                  <Analytics />
                </ProtectedRoute>
              } />

              <Route path="/upload" element={
                <ProtectedRoute allowedRoles={["CREATOR", "ADMIN"]}>
                  <Upload />
                </ProtectedRoute>
              } />
              <Route path="/watch-history" element={
                <ProtectedRoute allowedRoles={["VIEWER"]}>
                  <WatchHistory />
                </ProtectedRoute>
              } />
              <Route path="/liked-videos" element={
                <ProtectedRoute allowedRoles={["VIEWER"]}>
                  <LikedVideos />
                </ProtectedRoute>
              } />
              <Route path="/saved-videos" element={
                <ProtectedRoute allowedRoles={["VIEWER"]}>
                  <SavedVideos />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Settings and Profile - Conditional Layout based on user role */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
          </DashboardSidebarProvider>
        </ViewerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
