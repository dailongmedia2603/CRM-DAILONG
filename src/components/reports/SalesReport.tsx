import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSalesReportData, TimeRange } from "@/hooks/useSalesReportData";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, FileCheck, Percent, Clock } from "lucide-react";

export const SalesReport = () => {
  const { loading, processedData, salesPersonnel, timeRange, setTimeRange } = useSalesReportData();
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('all');

  const displayData = selectedPersonnelId === 'all' 
    ? processedData 
    : processedData.filter(p => p.salesPersonId === selectedPersonnelId);

  const overallStats = processedData.reduce((acc, curr) => {
    acc.totalLeads += curr.totalLeads;
    acc.signedContract += curr.signedContract;
    acc.currentOverdue += curr.currentOverdue;
    acc.historicalLapses += curr.historicalLapses;
    return acc;
  }, { totalLeads: 0, signedContract: 0, currentOverdue: 0, historicalLapses: 0 });

  const overallConversionRate = overallStats.totalLeads > 0 ? (overallStats.signedContract / overallStats.totalLeads) * 100 : 0;

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        {[...Array(10)].map((_, j) => (
          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
        ))}
      </TableRow>
    ))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc báo cáo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Phạm vi thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="all">Toàn bộ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPersonnelId} onValueChange={setSelectedPersonnelId}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Nhân viên Sale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhân viên</SelectItem>
              {salesPersonnel.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Tổng Leads" value={overallStats.totalLeads.toString()} icon={Users} />
        <StatsCard title="Hợp đồng ký" value={overallStats.signedContract.toString()} icon={FileCheck} />
        <StatsCard title="Tỷ lệ chuyển đổi" value={`${overallConversionRate.toFixed(2)}%`} icon={Percent} />
        <StatsCard title="Leads quá hạn" value={overallStats.currentOverdue.toString()} icon={Clock} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>So sánh hiệu suất nhân viên</CardTitle>
          <CardDescription>Biểu đồ so sánh tổng số lead và số hợp đồng đã ký.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="salesPersonName" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="totalLeads" name="Tổng Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="signedContract" name="Ký HĐ" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo chi tiết</CardTitle>
          <CardDescription>Phân tích chi tiết hiệu suất của từng nhân viên sale.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Tổng Leads</TableHead>
                  <TableHead>Ký HĐ</TableHead>
                  <TableHead>Tỷ lệ CĐ (%)</TableHead>
                  <TableHead>Tiềm năng</TableHead>
                  <TableHead>Đang làm việc</TableHead>
                  <TableHead>Đang suy nghĩ</TableHead>
                  <TableHead>Từ chối (Trạng thái)</TableHead>
                  <TableHead>Đang quá hạn</TableHead>
                  <TableHead>Lần trễ hẹn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderSkeleton() : displayData.map(data => (
                  <TableRow key={data.salesPersonId}>
                    <TableCell className="font-medium">{data.salesPersonName}</TableCell>
                    <TableCell>{data.totalLeads}</TableCell>
                    <TableCell>{data.signedContract}</TableCell>
                    <TableCell>{data.conversionRate.toFixed(2)}%</TableCell>
                    <TableCell>{data.potential}</TableCell>
                    <TableCell>{data.working}</TableCell>
                    <TableCell>{data.thinking}</TableCell>
                    <TableCell>{data.rejectedStatus}</TableCell>
                    <TableCell>{data.currentOverdue}</TableCell>
                    <TableCell>{data.historicalLapses}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};