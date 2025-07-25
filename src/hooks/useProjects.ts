import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project, Client } from "@/types";
import { startOfToday } from 'date-fns';
import { useAuth } from "@/context/AuthProvider";
import { useState, useEffect } from "react";

const fetchProjects = async (userId: string, userRole: string): Promise<Project[]> => {
  let query = supabase
    .from("projects")
    .select("*")
    .order('created_at', { ascending: false });

  if (userRole === 'Nhân viên' || userRole === 'Thực tập') {
    query = query.filter('team', 'cs', `[{"id":"${userId}"}]`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const updatedProjects = data.map(p => {
    const endDate = p.end_date ? new Date(p.end_date) : null;
    if (endDate && endDate < startOfToday() && p.status !== 'completed') {
      return { ...p, status: 'overdue' };
    }
    return p;
  });
  return updatedProjects as Project[];
};

const fetchClientsForProjects = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from("clients").select("id, company_name, name");
  if (error) throw new Error(error.message);
  return data as Client[];
};

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from('personnel')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(data?.role || '');
      }
    };
    fetchUserRole();
  }, [session]);

  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useQuery<Project[]>({
    queryKey: ['projects', session?.user?.id, userRole],
    queryFn: () => fetchProjects(session!.user.id, userRole),
    enabled: !!session?.user && !!userRole,
  });

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['clientsForProjects'],
    queryFn: fetchClientsForProjects,
  });

  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  return {
    projects: projects || [],
    clients: clients || [],
    isLoading: isLoadingProjects || isLoadingClients,
    error: projectsError || clientsError,
    invalidateProjects,
  };
};