import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, Personnel } from '@/types';

export const useProjectsReport = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [projectsRes, personnelRes] = await Promise.all([
        supabase.from('projects').select('*').eq('archived', false),
        supabase.from('personnel').select('id, name, avatar'),
      ]);

      if (projectsRes.data) setProjects(projectsRes.data as Project[]);
      if (personnelRes.data) setPersonnel(personnelRes.data as Personnel[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const reportData = useMemo(() => {
    if (loading || projects.length === 0 || personnel.length === 0) {
      return {
        totalProjects: 0,
        totalValue: 0,
        completionRate: 0,
        personnelStats: [],
        rankedProjects: [],
        chartData: [],
      };
    }

    // Overall Stats
    const totalProjects = projects.length;
    const totalValue = projects.reduce((sum, p) => sum + (p.contract_value || 0), 0);
    const completedCount = projects.filter(p => p.status === 'completed').length;
    const overdueCount = projects.filter(p => p.status === 'overdue').length;
    const completionRate = (completedCount + overdueCount) > 0 ? (completedCount / (completedCount + overdueCount)) * 100 : 100;

    // Personnel Stats
    const personnelMap = new Map<string, { info: Personnel; projects: Project[]; totalValue: number }>();
    personnel.forEach(p => {
      personnelMap.set(p.id, { info: p, projects: [], totalValue: 0 });
    });

    projects.forEach(project => {
      (project.team || []).forEach(member => {
        if (personnelMap.has(member.id)) {
          const stat = personnelMap.get(member.id)!;
          stat.projects.push(project);
          stat.totalValue += project.contract_value || 0;
        }
      });
    });

    const personnelStats = Array.from(personnelMap.values())
      .filter(p => p.projects.length > 0)
      .sort((a, b) => b.totalValue - a.totalValue);

    // Ranked Projects
    const rankedProjects = [...projects].sort((a, b) => (b.contract_value || 0) - (a.contract_value || 0));

    // Chart Data
    const chartData = personnelStats.map(p => ({
      name: p.info.name,
      projectCount: p.projects.length,
      totalValue: p.totalValue,
    }));

    return {
      totalProjects,
      totalValue,
      completionRate,
      personnelStats,
      rankedProjects,
      chartData,
    };
  }, [projects, personnel, loading]);

  return { loading, ...reportData };
};