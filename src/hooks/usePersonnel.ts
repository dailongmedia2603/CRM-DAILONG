import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Personnel, Position } from "@/types";

const fetchPersonnel = async (): Promise<Personnel[]> => {
  const { data, error } = await supabase.from("personnel").select("*");
  if (error) throw new Error(error.message);
  return data as Personnel[];
};

const fetchPositions = async (): Promise<Position[]> => {
  const { data, error } = await supabase.from("positions").select("*");
  if (error) throw new Error(error.message);
  return data as Position[];
};

export const usePersonnel = () => {
  const queryClient = useQueryClient();

  const { data: personnel, isLoading: isLoadingPersonnel, error: personnelError } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: fetchPersonnel,
  });

  const { data: positions, isLoading: isLoadingPositions, error: positionsError } = useQuery<Position[]>({
    queryKey: ['positions'],
    queryFn: fetchPositions,
  });

  const invalidatePersonnel = () => {
    queryClient.invalidateQueries({ queryKey: ['personnel'] });
  };
  
  const invalidatePositions = () => {
    queryClient.invalidateQueries({ queryKey: ['positions'] });
  };

  return {
    personnel: personnel || [],
    positions: positions || [],
    isLoading: isLoadingPersonnel || isLoadingPositions,
    error: personnelError || positionsError,
    invalidatePersonnel,
    invalidatePositions,
  };
};