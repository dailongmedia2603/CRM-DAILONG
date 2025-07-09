import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, List, Check, AlertTriangle } from "lucide-react";

const internPerformanceData = [
  { name: "An", "Việc hoàn thành": 30 },
  { name: "Bình", "Việc hoàn thành": 25 },
  { name: "Chi", "Việc hoàn thành": 40 },
  { name: "Dũng", "Việc hoàn thành": 22 },
  { name: "Giang", "Việc hoàn thành": 35 },
];

const topInterns = [
  { name: "Nguyễn Thị Chi", tasksCompleted: 40, overdue: 1 },
  { name: "Lê Văn Giang", tasksCompleted: 35, overdue: 0 },
  { name: "Trần Văn An", tasksCompleted: 30, overdue: 3 },
];

export const InternsReport = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Tổng việc đã giao" value="250" icon={List} />
        <StatsCard title="Tỷ lệ hoàn thành" value="88%" icon={Check} />
        <StatsCard title="Việc quá hạn" value="15" icon={AlertTriangle} />
        <StatsCard title="Số TTS hoạt động" value="5" icon={GraduationCap} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Hiệu suất Thực tập sinh"
          data={internPerformanceData}
          type="bar"
          dataKey="Việc hoàn thành"
          xAxis="name"
        />
        <Card>
          <CardHeader>
            <CardTitle>Top Thực tập sinh</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Việc hoàn thành</TableHead>
                  <TableHead>Việc quá hạn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topInterns.map((intern, index) => (
                  <TableRow key={index}>
                    <TableCell>{intern.name}</TableCell>
                    <TableCell>{intern.tasksCompleted}</TableCell>
                    <TableCell>{intern.overdue}</TableCell>
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