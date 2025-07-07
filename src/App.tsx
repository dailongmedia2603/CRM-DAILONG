import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ClientsPage from "./pages/clients/Index";
import ClientDetailsPage from "./pages/clients/Details";
import ProjectsPage from "./pages/projects/Index";
import LeadsPage from "./pages/sales/leads/Index";
import TasksManagementPage from "./pages/task-management/Index";
import InternsPage from "./pages/interns/Index";
import HRPage from "./pages/hr/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/sales/leads" element={<LeadsPage />} />
            <Route path="/task-management" element={<TasksManagementPage />} />
            <Route path="/interns" element={<InternsPage />} />
            <Route path="/hr" element={<HRPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;