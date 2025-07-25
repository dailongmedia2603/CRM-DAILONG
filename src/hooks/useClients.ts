import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client, Project } from "@/types";

const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from("clients").select("*");
  if (error) throw new Error(error.message);
  return data as Client[];
};

const fetchProjectsForClients = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from("projects").select("client_id, contract_value");
  if (error) throw new Error(error.message);
  return data as Project[];
};

export const useClients = () => {
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useQuery<Project[]>({
    queryKey: ['projectsForClients'],
    queryFn: fetchProjectsForClients,
  });

  const invalidateClients = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['projectsForClients'] });
  };

  return {
    clients: clients || [],
    projects: projects || [],
    isLoading: isLoadingClients || isLoadingProjects,
    error: clientsError || projectsError,
    invalidateClients,
  };
};