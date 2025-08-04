import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InternTask, Personnel } from '@/types';
import { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';

export const useInternsReport = () => {
  const [tasks, setTasks] = useState<InternTask[]>([]);
  const [interns, setInterns] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternId, setSelectedInternId] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tasksRes, internsRes] = await Promise.all([
        supabase.from('intern_tasks').select('*'),
        supabase.from('personnel').select('*').eq('role', 'Thực tập')
      ]);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (internsRes.data) setInterns(internsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.created_at!);
      const internMatch = selectedInternId === 'all' || task.intern_name === interns.find(i => i.id === selectedInternId)?.name;
      const dateMatch = !dateRange?.from || (taskDate >= startOfDay(dateRange.from) && taskDate <= endOfDay(dateRange.to || dateRange.from));
      return internMatch && dateMatch;
    });
  }, [tasks, interns, selectedInternId, dateRange]);

  const reportData = useMemo(() => {
    const stats = {
      totalAssignedComments: 0,
      totalAssignedPosts: 0,
      totalAssignedPostScans: 0,
      overdueTasksCount: 0,
      unreportedOverdueTasks: [] as InternTask[],
    };

    const internPerformanceMap = new Map<string, { totalTasks: number, completedTasks: number, internInfo: Personnel | undefined }>();
    
    const relevantInterns = selectedInternId === 'all' ? interns : interns.filter(i => i.id === selectedInternId);
    relevantInterns.forEach(intern => {
        internPerformanceMap.set(intern.name, {
            totalTasks: 0,
            completedTasks: 0,
            internInfo: intern
        });
    });

    filteredTasks.forEach(task => {
      stats.totalAssignedComments += task.comment_count || 0;
      stats.totalAssignedPosts += task.post_count || 0;
      stats.totalAssignedPostScans += task.post_scan_count || 0;

      if (task.completed_at && new Date(task.completed_at) > new Date(task.deadline)) {
        stats.overdueTasksCount++;
      }

      if (new Date() > new Date(task.deadline) && task.status !== 'Hoàn thành' && !task.report_reason) {
        stats.unreportedOverdueTasks.push(task);
      }

      if (internPerformanceMap.has(task.intern_name)) {
        const internData = internPerformanceMap.get(task.intern_name)!;
        internData.totalTasks++;
        if (task.status === 'Hoàn thành') {
          internData.completedTasks++;
        }
      }
    });

    const internPerformance = Array.from(internPerformanceMap.values()).map(data => ({
      name: data.internInfo?.name || 'Unknown',
      avatar: data.internInfo?.avatar,
      totalTasks: data.totalTasks,
      completedTasks: data.completedTasks,
      completionRate: data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0,
    })).sort((a, b) => b.totalTasks - a.totalTasks);

    return { ...stats, internPerformance };
  }, [filteredTasks, interns, selectedInternId]);

  return { loading, interns, reportData, selectedInternId, setSelectedInternId, dateRange, setDateRange };
};