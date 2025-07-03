import { useState, useEffect } from "react";
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
import TasksPage from "./pages/tasks/Index";
import NotFound from "./pages/NotFound";
import { getClients, setClients, getProjects, setProjects } from "@/utils/storage";
import { clientsData as initialClients, Client } from "@/data/clients";
import { projectsData as initialProjects, Project } from "@/data/projects"; // Assuming projects data is exported

const queryClient = new QueryClient();

const App = () => {
  const [clients, setClientsState] = useState<Client[]>([]);
  const [projects, setProjectsState] = useState<Project[]>([]);

  useEffect(() => {
    const storedClients = getClients();
    if (storedClients !== null) {
      setClientsState(storedClients);
    } else {
      setClientsState(initialClients);
      setClients(initialClients);
    }

    const storedProjects = getProjects();
    if (storedProjects !== null) {
      setProjectsState(storedProjects);
    } else {
      setProjectsState(initialProjects);
      setProjects(initialProjects);
    }
  }, []);

  const handleSetClients = (newClients: Client[]) => {
    setClientsState(newClients);
    setClients(newClients);
  };

  const handleSetProjects = (newProjects: Project[]) => {
    setProjectsState(newProjects);
    setProjects(newProjects);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/clients" element={<ClientsPage clients={clients} setClients={handleSetClients} />} />
            <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="/projects" element={<ProjectsPage projects={projects} clients={clients} setProjects={handleSetProjects} />} />
            <Route path="/sales/leads" element={<LeadsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/interns/tasks" element={<TasksPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;