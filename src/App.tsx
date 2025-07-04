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
import TasksManagementPage from "./pages/task-management/Index";
import InternsPage from "./pages/interns/Index";
import HRPage from "./pages/hr/Index";
import NotFound from "./pages/NotFound";
import { getClients, setClients, getProjects, setProjects, getPersonnel, setPersonnel, getTasks, setTasks, getInternTasks, setInternTasks } from "@/utils/storage";
import { clientsData as initialClients, Client, Project } from "@/data/clients";
import { projectsData as initialProjects } from "@/data/projects";
import { personnelData as initialPersonnel, Personnel } from "@/data/personnel";
import { tasksData as initialTasks, Task } from "@/data/tasks";
import { internTasksData as initialInternTasks, InternTask } from "@/data/internTasks";

const queryClient = new QueryClient();

const App = () => {
  // State for features not yet migrated to Supabase
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [personnel, setPersonnelState] = useState<Personnel[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [internTasks, setInternTasksState] = useState<InternTask[]>([]);

  useEffect(() => {
    // These will be migrated to Supabase later
    setProjectsState(getProjects() ?? initialProjects);
    setPersonnelState(getPersonnel() ?? initialPersonnel);
    setTasksState(getTasks() ?? initialTasks);
    setInternTasksState(getInternTasks() ?? initialInternTasks);
  }, []);

  const handleSetProjects = (newProjects: Project[]) => {
    setProjectsState(newProjects);
    setProjects(newProjects);
  };

  const handleSetPersonnel = (newPersonnel: Personnel[]) => {
    setPersonnelState(newPersonnel);
    setPersonnel(newPersonnel);
  };

  const handleSetTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
    setTasks(newTasks);
  };

  const handleSetInternTasks = (newTasks: InternTask[]) => {
    setInternTasksState(newTasks);
    setInternTasks(newTasks);
  };

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
            <Route path="/projects" element={<ProjectsPage projects={projects} clients={[]} setProjects={handleSetProjects} />} />
            <Route path="/sales/leads" element={<LeadsPage />} />
            <Route path="/task-management" element={<TasksManagementPage tasks={tasks} setTasks={handleSetTasks} personnel={personnel} />} />
            <Route path="/interns" element={<InternsPage tasks={internTasks} setTasks={handleSetInternTasks} personnel={personnel} />} />
            <Route path="/hr" element={<HRPage personnel={personnel} setPersonnel={handleSetPersonnel} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;