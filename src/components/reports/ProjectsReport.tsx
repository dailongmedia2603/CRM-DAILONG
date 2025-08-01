import { useMemo } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, CheckCircle, DollarSign, Award, BarChart, User } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useProjectsReport } from "@/hooks/useProjectsReport";
import { cn } from "@/lib/utils";
import { Project } from "@/types";

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const statusTextMap: { [key: string]: string } = {
  planning: "Pending",
  "in-progress": "Đang chạy",
  completed: "Hoàn thành",
  overdue: "Quá hạn",
};

const statusColorMap: { [key: string]: string } = {
  planning: "bg-amber-100 text-amber-800 border-amber-200",
  "in-progress": "bg-cyan-100 text-cyan-800 border-cyan-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
};

const ProjectRow = ({ project }: { project: Project }) => (
  <TableRow>
    <TableCell className="font-medium">{project.name}</TableCell>
    <TableCell>{project.client_name}</TableCell>
    <TableCell>{formatCurrency(project.contract_value)}</TableCell>
    <TableCell>
      <Badge variant="outline" className={cn("capitalize", statusColorMap[project.status])}>
        {statusTextMap[project.status] || project.status}
      </Badge>
    </TableCell>
  </TableRow>
);

export const ProjectsReport = () => {
  const { loading, totalProjects, totalValue, completionRate, personnelStats, rankedProjects, chartData } = useProjectsReport();

  const topProjects = useMemo(() => rankedProjects.slice(0, 5), [rankedProjects]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Tổng dự án" value={totalProjects} icon={Briefcase} description="Dự án đang hoạt động" className="bg-blue-50 border-blue-200" />
        <StatsCard title="Tổng giá trị HĐ" value={formatCurrency(totalValue)} icon={DollarSign} description="Tổng doanh thu từ các dự án" className="bg-green-50 border-green-200" />
        <StatsCard title="Tỷ lệ hoàn thành" value={`${completionRate.toFixed(0)}%`} icon={CheckCircle} description="Dựa trên dự án đã xong & quá hạn" className="bg-purple-50 border-purple-200" />
      </div>

      {/* Personnel Performance */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="text-blue-600" /> Báo cáo theo Nhân sự</CardTitle>
          <CardDescription>Phân tích hiệu suất và khối lượng công việc của từng nhân sự.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {personnelStats.map(({ info, projects, totalValue }) => (
              <AccordionItem value={info.id} key={info.id}>
                <AccordionTrigger className="hover:bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarImage src={info.avatar} /><AvatarFallback>{info.name.charAt(0)}</AvatarFallback></Avatar>
                      <span className="font-semibold">{info.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">Số dự án: {projects.length}</Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Tổng giá trị: {formatCurrency(totalValue)}</Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên dự án</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map(p => <ProjectRow key={p.id} project={p} />)}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Project Ranking */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="text-amber-500" /> Xếp hạng Dự án</CardTitle>
              <CardDescription>Top 5 dự án có giá trị hợp đồng cao nhất.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Tên dự án</TableHead>
                    <TableHead>Giá trị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProjects.map((project, index) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-bold">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">{project.client_name}</div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">{formatCurrency(project.contract_value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Chart */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart className="text-purple-600" /> So sánh hiệu suất</CardTitle>
              <CardDescription>So sánh số lượng và tổng giá trị dự án của nhân sự.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={1} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fontSize: 10 }} label={{ value: 'Số lượng dự án', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '12px' } }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tickFormatter={(value) => `${value / 1000000}M`} tick={{ fontSize: 10 }} label={{ value: 'Tổng giá trị (VND)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: '12px' } }} />
                  <Tooltip formatter={(value, name) => name === 'totalValue' ? formatCurrency(value as number) : value} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="projectCount" name="Số dự án" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="totalValue" name="Tổng giá trị" fill="#10b981" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};