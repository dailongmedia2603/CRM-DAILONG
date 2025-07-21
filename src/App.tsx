import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { AbilityProvider } from "./context/AbilityProvider";

// Pages
import Index from "./pages/Index";
import ClientsPage from "./pages/clients/Index";
import ClientDetailsPage from "./pages/clients/Details";
import ProjectsPage from "./pages/projects/Index";
import LeadsPage from "./pages/sales/leads/Index";
import TasksManagementPage from "./pages/task-management/Index";
import InternsPage from "./pages/interns/Index";
import HRPage from "./pages/hr/Index";
import ReportsPage from "./pages/reports/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NoAccessPage from "./pages/NoAccess";

// Tạo một QueryClient và tắt tính năng refetchOnWindowFocus
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tắt tính năng tự động tải lại khi focus vào cửa sổ
      retry: false, // Cũng có thể tắt tự động thử lại để tránh các lần fetch không mong muốn
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AbilityProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/no-access" element={<NoAccessPage />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/sales/leads" element={<LeadsPage />} />
                  <Route path="/task-management" element={<TasksManagementPage />} />
                  <Route path="/interns" element={<InternsPage />} />
                  <Route path="/hr" element={<HRPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AbilityProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;