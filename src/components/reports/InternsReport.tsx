import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { InternTask, Personnel } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { vi } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { MessageSquare, ClipboardList, Clock, AlertTriangle, Calendar as CalendarIcon } from "lucide-react";

const StatCard = ({ icon: Icon, title, value, description }: { icon: React.ElementType, title: string, value: string | number, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const useInternsReport = () => {
  const [tasks, setTasks] = useState<InternTask[]>([]);
  const [interns, setInterns] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

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

  return { tasks, interns, loading };
};

export const InternsReport = () => {
  const { tasks, interns, loading } = useInternsReport();
  const [selectedInternId, setSelectedInternId] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.created_at!);
      const isInternMatch = selectedInternId === 'all' || task.intern_name === interns.find(i => i.id === selectedInternId)?.name;
      const isDateMatch = dateRange?.from && dateRange?.to ? (taskDate >= startOfDay(dateRange.from) && taskDate <= endOfDay(dateRange.to)) : true;
      return isInternMatch && isDateMatch;
    });
  }, [tasks, selectedInternId, dateRange, interns]);

  const reportData = useMemo(() => {
    const stats = {
      totalAssignedComments: 0,
      totalAssignedPosts: 0,
      totalCompletedComments: 0,
      totalCompletedPosts: 0,
      overdueTasksCount: 0,
      unreportedOverdueTasks: [] as InternTask[],
    };

    const internStats: { [key: string]: { totalTasks: number, completedTasks: number } } = {};

    filteredTasks.forEach(task => {
      // Initialize intern stats if not present
      if (!internStats[task.intern_name]) {
        internStats[task.intern_name] = { totalTasks: 0, completedTasks: 0 };
      }
      internStats[task.intern_name].totalTasks++;

      stats.totalAssignedComments += task.comment_count || 0;
      stats.totalAssignedPosts += task.post_count || 0;

      if (task.status === 'Hoàn thành') {
        stats.totalCompletedComments += task.comment_count || 0;
        stats.totalCompletedPosts += task.post_count || 0;
        internStats[task.intern_name].completedTasks++;
      }

      const isOverdue = task.completed_at && new Date(task.completed_at) > new Date(task.deadline);
      if (isOverdue) {
        stats.overdueTasksCount++;
      }
      
      const isCurrentlyOverdue = new Date() > new Date(task.deadline) && task.status !== 'Hoàn thành';
      if (isCurrentlyOverdue && !task.report_reason) {
        stats.unreportedOverdueTasks.push(task);
      }
    });

    const internPerformance = Object.entries(internStats).map(([name, data]) => ({
      name,
      ...data,
      completionRate: data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0,
    })).sort((a, b) => b.totalTasks - a.totalTasks);

    return { ...stats, internPerformance };
  }, [filteredTasks]);

  const setTimeRangePreset = (preset: 'thisWeek' | 'thisMonth') => {
    const now = new Date();
    if (preset === 'thisWeek') {
      setDateRange({ from: startOfWeek(now, { locale: vi }), to: endOfWeek(now, { locale: vi }) });
    } else {
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
    }
  };

  if (loading) {
    return <div className="space-y-6">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc báo cáo</CardTitle>
          <CardDescription>Lọc dữ liệu theo thực tập sinh và khoảng thời gian.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedInternId} onValueChange={setSelectedInternId}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Chọn thực tập sinh" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tất cả thực tập sinh</SelectItem>{interns.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTimeRangePreset('thisWeek')}>Tuần này</Button>
            <Button variant="outline" onClick={() => setTimeRangePreset('thisMonth')}>Tháng này</Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MessageSquare} title="Comment được giao" value={reportData.totalAssignedComments} description="Tổng số comment trong các task" />
        <StatCard icon={ClipboardList} title="Post được giao" value={reportData.totalAssignedPosts} description="Tổng số post trong các task" />
        <StatCard icon={Clock} title="Công việc quá hạn" value={reportData.overdueTasksCount} description="Số lần hoàn thành công việc trễ deadline" />
        <StatCard icon={AlertTriangle} title="Quá hạn chưa báo cáo" value={reportData.unreportedOverdueTasks.length} description="Số task đang quá hạn và chưa có báo cáo" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Hiệu suất theo Thực tập sinh</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Thực tập sinh</TableHead><TableHead>Tổng việc</TableHead><TableHead>Việc hoàn thành</TableHead><TableHead>Tỷ lệ hoàn thành</TableHead></TableRow></TableHeader>
              <TableBody>
                {reportData.internPerformance.map(intern => (
                  <TableRow key={intern.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarFallback>{intern.name.charAt(0)}</AvatarFallback></Avatar>
                        <span className="font-medium">{intern.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{intern.totalTasks}</TableCell>
                    <TableCell>{intern.completedTasks}</TableCell>
                    <TableCell><Progress value={intern.completionRate} className="w-32" /> </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Công việc quá hạn chưa báo cáo</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {reportData.unreportedOverdueTasks.length > 0 ? reportData.unreportedOverdueTasks.map(task => (
              <div key={task.id} className="p-2 rounded-md border">
                <Link to={`/interns?search=${task.title}`} className="font-medium hover:underline">{task.title}</Link>
                <p className="text-sm text-muted-foreground">{task.intern_name} - Deadline: {format(new Date(task.deadline), "dd/MM/yyyy")}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">Không có công việc nào.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};