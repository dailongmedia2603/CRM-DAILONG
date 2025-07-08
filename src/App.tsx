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
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

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
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/sales/leads" element={<LeadsPage />} />
                  <Route path="/task-management" element={<TasksManagementPage />} />
                  <Route path="/interns" element={<InternsPage />} />
                  <Route path="/hr" element={<HRPage />} />
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