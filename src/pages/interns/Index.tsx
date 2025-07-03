import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const interns = [
  { id: "intern-1", name: "Nguyễn Văn An" },
  { id: "intern-2", name: "Trần Thị Bình" },
  { id: "intern-3", name: "Lê Văn Cường" },
];

const initialTasks = [
  { id: "task-1", title: "Nghiên cứu từ khóa cho dự án X", assigneeId: "intern-1", assignedDate: "2025-07-01", dueDate: "2025-07-05", status: "in-progress" },
  { id: "task-2", title: "Viết 5 bài blog về chủ đề Y", assigneeId: "intern-2", assignedDate: "2025-07-01", dueDate: "2025-07-08", status: "todo" },
  { id: "task-3", title: "Thiết kế banner cho sự kiện Z", assigneeId: "intern-1", assignedDate: "2025-07-02", dueDate: "2025-07-04", status: "in-progress" },
  { id: "task-4", title: "Báo cáo phân tích đối thủ", assigneeId: "intern-3", assignedDate: "2025-06-30", dueDate: "2025-07-03", status: "completed" },
];

const statusConfig = {
  "todo": { text: "Cần làm", className: "bg-gray-100 text-gray-800" },
  "in-progress": { text: "Đang làm", className: "bg-blue-100 text-blue-800" },
  "completed": { text: "Hoàn thành", className: "bg-green-100 text-green-800" },
};

const InternsPage = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const getAssigneeName = (assigneeId: string) => {
    return interns.find(i => i.id === assigneeId)?.name || "N/A";
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý công việc Thực tập sinh</h1>
            <p className="text-muted-foreground">Giao và theo dõi công việc cho các thực tập sinh.</p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Giao việc mới
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Danh sách công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên công việc</TableHead>
                  <TableHead>Người thực hiện</TableHead>
                  <TableHead>Ngày giao</TableHead>
                  <TableHead>Hạn chót</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{getAssigneeName(task.assigneeId)}</TableCell>
                    <TableCell>{formatDate(task.assignedDate)}</TableCell>
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                    <TableCell>
                      <Badge className={cn(statusConfig[task.status as keyof typeof statusConfig].className)}>
                        {statusConfig[task.status as keyof typeof statusConfig].text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InternsPage;