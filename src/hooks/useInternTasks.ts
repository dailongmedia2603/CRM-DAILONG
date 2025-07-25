import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InternTask, Personnel } from "@/types";

const fetchInternTasks = async (): Promise<InternTask[]> => {
  const { data, error } = await supabase.from("intern_tasks").select("*").order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as InternTask[];
};

const fetchPersonnel = async (): Promise<Personnel[]> => {
  const { data, error } = await supabase.from("personnel").select("*");
  if (error) throw new Error(error.message);
  return data as Personnel[];
};

export const useInternTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery<InternTask[]>({
    queryKey: ['intern_tasks'],
    queryFn: fetchInternTasks,
  });

  const { data: personnel, isLoading: isLoadingPersonnel, error: personnelError } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: fetchPersonnel,
  });

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: ['intern_tasks'] });
  };

  return {
    tasks: tasks || [],
    personnel: personnel || [],
    isLoading: isLoadingTasks || isLoadingPersonnel,
    error: tasksError || personnelError,
    invalidateTasks,
  };
};