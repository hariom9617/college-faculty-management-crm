import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import SubmitReport from "./pages/faculty/SubmitReport";
import HodDashboard from "./pages/hod/HodDashboard";
import HodFacultyList from "./pages/hod/HodFacultyList";
import HodTimetable from "./pages/hod/HodTimetable";
import HodSubjects from "./pages/hod/HodSubjects";
import HodReports from "./pages/hod/HodReports";
import RegistrarDashboard from "./pages/registrar/RegistrarDashboard";
import RegistrarReports from "./pages/registrar/RegistrarReports";
import RegistrarBranches from "./pages/registrar/RegistrarBranches";
import RegistrarBranchDetail from "./pages/registrar/RegistrarBranchDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show nothing while loading to prevent flash of login page
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      {/* Faculty Routes */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/submit-report"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <SubmitReport />
          </ProtectedRoute>
        }
      />

      {/* HOD Routes */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={['hod']}>
            <HodDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/subjects"
        element={
          <ProtectedRoute allowedRoles={['hod']}>
            <HodSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/timetable"
        element={
          <ProtectedRoute allowedRoles={['hod']}>
            <HodTimetable />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/faculty"
        element={
          <ProtectedRoute allowedRoles={['hod']}>
            <HodFacultyList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/reports"
        element={
          <ProtectedRoute allowedRoles={['hod']}>
            <HodReports />
          </ProtectedRoute>
        }
      />

      {/* Registrar Routes */}
      <Route
        path="/registrar"
        element={
          <ProtectedRoute allowedRoles={['registrar']}>
            <RegistrarDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registrar/branches"
        element={
          <ProtectedRoute allowedRoles={['registrar']}>
            <RegistrarBranches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registrar/branches/:branchId"
        element={
          <ProtectedRoute allowedRoles={['registrar']}>
            <RegistrarBranchDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registrar/reports"
        element={
          <ProtectedRoute allowedRoles={['registrar']}>
            <RegistrarReports />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
