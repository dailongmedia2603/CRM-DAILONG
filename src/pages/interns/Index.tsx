import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, List, Clock, CheckCircle, AlertTriangle, Eye, ExternalLink, TrendingUp } from 'lucide-react';
import { InternTask, internTasksData } from '@/data/internTasks';
import { cn } from '@/lib/utils';

const StatCard = ({ icon, title, value, subtitle, iconBgColor }: { icon: React.ElementType, title: string, value: number, subtitle: string, iconBgColor: string }) => {
  const Icon = icon;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center">
        <div className={cn("p-3 rounded-lg mr-4", iconBgColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </CardContent>
    </Card>
  );
};

const InternsPage = () => {
  const [tasks, setTasks] = useState<InternTask[]>(internTasksData);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.internName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  const stats = useMemo(() => ({
    total: tasks.length,
    inProgress: tasks.filter(t => t.commentStatus === 'Đang làm' || t.postStatus === 'Đang làm').length,
    completed: tasks.filter(t => t.commentStatus === 'Hoàn thành' && t.postStatus === 'Hoàn thành').length,
    overdue: tasks.filter(t => new Date(t.deadline) < new Date()).length,
  }), [tasks]);

  const getPriorityBadge = (priority: InternTask['priority']) => {
    switch (priority) {
      case 'Cao': return 'bg-red-100 text-red-800';
      case 'Bình thường': return 'bg-blue-100 text-blue-800';
      case 'Thấp': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  };

  const getStatusBadge = (status: InternTask['commentStatus']) => {
    switch (status) {
      case 'Đang làm': return 'bg-blue-100 text-blue-800';
      case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
      case 'Hoàn thành': return 'bg-green-100 text-green-800';
      default: return '';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Giao việc thực tập sinh</h1>
            <p className="text-muted-foreground">Quản lý và theo dõi công việc được giao cho thực tập sinh</p>
          </div>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> Giao việc mới
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={List} title="Tổng số việc" value={stats.total} subtitle="Tất cả công việc" iconBgColor="bg-blue-500" />
          <StatCard icon={Clock} title="Đang thực hiện" value={stats.inProgress} subtitle="Công việc đang chạy" iconBgColor="bg-cyan-500" />
          <StatCard icon={CheckCircle} title="Hoàn thành" value={stats.completed} subtitle="Công việc đã xong" iconBgColor="bg-green-500" />
          <StatCard icon={AlertTriangle} title="Quá hạn" value={stats.overdue} subtitle="Công việc trễ deadline" iconBgColor="bg-red-500" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm công việc hoặc thực tập sinh..."
            className="pl-10 py-6 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[30%]">CÔNG VIỆC</TableHead>
                <TableHead>THỰC TẬP SINH</TableHead>
                <TableHead>DEADLINE</TableHead>
                <TableHead>ƯU TIÊN</TableHead>
                <TableHead>COMMENT</TableHead>
                <TableHead>POST</TableHead>
                <TableHead>FILE LÀM VIỆC</TableHead>
                <TableHead>TIẾN ĐỘ</TableHead>
                <TableHead>THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  </TableCell>
                  <TableCell>{task.internName}</TableCell>
                  <TableCell>{new Date(task.deadline).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell><Badge className={cn("capitalize", getPriorityBadge(task.priority))}>{task.priority}</Badge></TableCell>
                  <TableCell><Badge className={cn("capitalize", getStatusBadge(task.commentStatus))}>{task.commentStatus}</Badge></TableCell>
                  <TableCell><Badge className={cn("capitalize", getStatusBadge(task.postStatus))}>{task.postStatus}</Badge></TableCell>
                  <TableCell>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">{task.fileCount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">{task.progressCount}</div>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <a href={task.fileLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      <ExternalLink className="h-4 w-4 mr-1" /> Link File
                    </a>
                    <Button variant="ghost" size="icon"><Eye className="h-5 w-5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default InternsPage;