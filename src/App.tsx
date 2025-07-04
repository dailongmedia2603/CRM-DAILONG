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
import InternsPage from "./pages/interns/Index";
import HRPage from "./pages/hr/Index";
import NotFound from "./pages/NotFound";
import { getClients, setClients, getProjects, setProjects, getPersonnel, setPersonnel } from "@/utils/storage";
import { clientsData as initialClients, Client, Project } from "@/data/clients";
import { projectsData as initialProjects } from "@/data/projects";
import { personnelData as initialPersonnel, Personnel } from "@/data/personnel";

const queryClient = new QueryClient();

const App = () => {
  const [clients, setClientsState] = useState<Client[]>([]);
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [personnel, setPersonnelState] = useState<Personnel[]>([]);

  useEffect(() => {
    // Load clients
    const storedClients = getClients();
    setClientsState(storedClients ?? initialClients);

    // Load projects
    const storedProjects = getProjects();
    setProjectsState(storedProjects ?? initialProjects);

    // Load personnel
    const storedPersonnel = getPersonnel();
    setPersonnelState(storedPersonnel ?? initialPersonnel);
  }, []);

  const handleSetClients = (newClients: Client[]) => {
    setClientsState(newClients);
    setClients(newClients);
  };

  const handleSetProjects = (newProjects: Project[]) => {
    setProjectsState(newProjects);
    setProjects(newProjects);
  };

  const handleSetPersonnel = (newPersonnel: Personnel[]) => {
    setPersonnelState(newPersonnel);
    setPersonnel(newPersonnel);
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
            <Route path="/interns" element={<InternsPage />} />
            <Route path="/hr" element={<HRPage personnel={personnel} setPersonnel={handleSetPersonnel} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;