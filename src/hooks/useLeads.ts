import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead, Personnel } from "@/types";
import { useAuth } from "@/context/AuthProvider";
import { useEffect, useState } from "react";

const fetchLeads = async (userId: string, userRole: string): Promise<Lead[]> => {
  let query = supabase
    .from("leads")
    .select("*, lead_history(*)")
    .order('created_at', { ascending: false });

  if (userRole === 'Nhân viên' || userRole === 'Thực tập') {
    query = query.eq('created_by_id', userId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as any[];
};

const fetchPersonnel = async (): Promise<Personnel[]> => {
  const { data, error } = await supabase.from("personnel").select("*");
  if (error) throw new Error(error.message);
  return data as Personnel[];
};

export const useLeads = () => {
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

  const { data: leads, isLoading: isLoadingLeads, error: leadsError } = useQuery<Lead[]>({
    queryKey: ['leads', session?.user?.id, userRole],
    queryFn: () => fetchLeads(session!.user.id, userRole),
    enabled: !!session?.user && !!userRole,
  });

  const { data: personnel, isLoading: isLoadingPersonnel, error: personnelError } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: fetchPersonnel,
  });

  const invalidateLeads = () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  return {
    leads: leads || [],
    personnel: personnel || [],
    isLoading: isLoadingLeads || isLoadingPersonnel,
    error: leadsError || personnelError,
    invalidateLeads,
  };
};