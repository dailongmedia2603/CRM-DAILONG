import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const projectStatusData = [
  { name: "Đang chạy", value: 45, fill: "#3b82f6" },
  { name: "Hoàn thành", value: 80, fill: "#10b981" },
  { name: "Pending", value: 15, fill: "#f59e0b" },
  { name: "Quá hạn", value: 5, fill: "#ef4444" },
];

const recentProjects = [
  { name: "Website Redesign", client: "ABC Corp", status: "Hoàn thành", budget: "50,000,000đ" },
  { name: "Marketing Campaign", client: "XYZ Inc", status: "Đang chạy", budget: "120,000,000đ" },
  { name: "Mobile App", client: "Tech Innovators", status: "Quá hạn", budget: "250,000,000đ" },
];

export const ProjectsReport = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Tổng dự án" value="145" icon={Briefcase} />
        <StatsCard title="Tỷ lệ hoàn thành đúng hạn" value="85%" icon={CheckCircle} trend="up" trendValue="+5%" />
        <StatsCard title="Thời gian trung bình" value="45 ngày" icon={Clock} />
        <StatsCard title="Tổng giá trị hợp đồng" value="2,500,000,000đ" icon={DollarSign} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Phân bổ trạng thái dự án"
          data={projectStatusData}
          type="pie"
          dataKey="value"
        />
        <Card>
          <CardHeader>
            <CardTitle>Dự án gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dự án</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngân sách</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project, index) => (
                  <TableRow key={index}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell><Badge variant="outline">{project.status}</Badge></TableCell>
                    <TableCell>{project.budget}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};