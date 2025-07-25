import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import { AbilityProvider } from "./context/AbilityProvider";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Component con để thực hiện pre-fetching, chỉ chạy khi người dùng đã đăng nhập.
const Prefetcher = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      // Tải trước các dữ liệu chung không phụ thuộc vào vai trò
      queryClient.prefetchQuery({ queryKey: ['clients'], queryFn: async () => (await supabase.from('clients').select('*')).data });
      queryClient.prefetchQuery({ queryKey: ['personnel'], queryFn: async () => (await supabase.from('personnel').select('*')).data });
      queryClient.prefetchQuery({ queryKey: ['positions'], queryFn: async () => (await supabase.from('positions').select('*')).data });
      queryClient.prefetchQuery({ queryKey: ['intern_tasks'], queryFn: async () => (await supabase.from('intern_tasks').select('*')).data });
      
      // Các query phụ thuộc vào session/role sẽ được các hook tự xử lý,
      // nhưng chúng sẽ nhanh hơn vì dữ liệu chung (personnel) đã có sẵn.
    }
  }, [session, queryClient]);

  return null; // Component này không render gì cả
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AbilityProvider>
              <Prefetcher />
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