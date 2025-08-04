import { useState } from "react";
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
import { useInternsReport } from "@/hooks/useInternsReport";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { vi } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { MessageSquare, ClipboardList, Clock, AlertTriangle, Calendar as CalendarIcon, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const InternsReport = () => {
  const { loading, interns, reportData, selectedInternId, setSelectedInternId, dateRange, setDateRange } = useInternsReport();

  const setTimeRangePreset = (preset: 'thisWeek' | 'thisMonth') => {
    const now = new Date();
    if (preset === 'thisWeek') {
      setDateRange({ from: startOfWeek(now, { locale: vi }), to: endOfWeek(now, { locale: vi }) });
    } else {
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
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
                <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatsCard 
          title="Comment được giao" 
          value={reportData.totalAssignedComments} 
          description="Tổng số comment trong các task" 
          icon={MessageSquare}
          className="bg-blue-50 border-blue-200"
        />
        <StatsCard 
          title="Post được giao" 
          value={reportData.totalAssignedPosts} 
          description="Tổng số post trong các task" 
          icon={ClipboardList}
          className="bg-green-50 border-green-200"
        />
        <StatsCard 
          title="Post Scan được giao" 
          value={reportData.totalAssignedPostScans} 
          description="Tổng số post scan trong các task" 
          icon={ScanSearch}
          className="bg-purple-50 border-purple-200"
        />
        <StatsCard 
          title="Công việc quá hạn" 
          value={reportData.overdueTasksCount} 
          description="Số lần hoàn thành trễ deadline" 
          icon={Clock}
          className="bg-amber-50 border-amber-200"
        />
        <StatsCard 
          title="Quá hạn chưa báo cáo" 
          value={reportData.unreportedOverdueTasks.length} 
          description="Task đang trễ và chưa có báo cáo" 
          icon={AlertTriangle}
          className="bg-red-50 border-red-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Hiệu suất theo Thực tập sinh</CardTitle>
            <CardDescription>Phân tích hiệu suất làm việc của từng thực tập sinh trong khoảng thời gian đã chọn.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thực tập sinh</TableHead>
                  <TableHead className="text-center">Tổng việc</TableHead>
                  <TableHead className="text-center">Việc hoàn thành</TableHead>
                  <TableHead>Tỷ lệ hoàn thành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.internPerformance.map(intern => (
                  <TableRow key={intern.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarImage src={intern.avatar} /><AvatarFallback>{intern.name.charAt(0)}</AvatarFallback></Avatar>
                        <span className="font-medium">{intern.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{intern.totalTasks}</TableCell>
                    <TableCell className="text-center font-medium text-green-600">{intern.completedTasks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={intern.completionRate} className="w-24 h-2" />
                        <span className="text-sm font-semibold text-muted-foreground">{intern.completionRate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Công việc quá hạn chưa báo cáo</CardTitle>
            <CardDescription>Các công việc đã trễ deadline nhưng chưa có báo cáo giải trình.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportData.unreportedOverdueTasks.length > 0 ? reportData.unreportedOverdueTasks.map(task => (
              <div key={task.id} className="p-3 rounded-lg border bg-red-50 border-red-100 hover:bg-red-100 transition-colors">
                <Link to={`/interns?search=${task.title}`} className="font-semibold text-red-800 hover:underline">{task.title}</Link>
                <p className="text-sm text-red-700">{task.intern_name} - Deadline: {format(new Date(task.deadline), "dd/MM/yyyy")}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-8">Không có công việc nào.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};