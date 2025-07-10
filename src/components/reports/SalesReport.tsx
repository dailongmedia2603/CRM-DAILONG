import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSalesReportData, TimeRange, SalesReportData } from "@/hooks/useSalesReportData";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, FileCheck, Percent, Clock, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Personnel } from "@/types";

const TopPerformer = ({ rank, data, personnel }: { rank: number, data: SalesReportData, personnel: Personnel[] }) => {
  const user = personnel.find(p => p.id === data.salesPersonId);
  const rankColors = [
    "bg-amber-400 text-amber-900", // Gold
    "bg-slate-400 text-slate-900", // Silver
    "bg-orange-400 text-orange-900"  // Bronze
  ];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-bold", rankColors[rank - 1] || "bg-gray-200")}>
          {rank}
        </div>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>{data.salesPersonName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{data.salesPersonName}</p>
          <p className="text-sm text-muted-foreground">{data.signedContract} hợp đồng</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg">{data.conversionRate.toFixed(1)}%</p>
        <p className="text-xs text-muted-foreground">Tỷ lệ CĐ</p>
      </div>
    </div>
  );
};

export const SalesReport = () => {
  const { loading, processedData, salesPersonnel, timeRange, setTimeRange } = useSalesReportData();
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('all');

  const displayData = useMemo(() => {
    const data = selectedPersonnelId === 'all' 
      ? processedData 
      : processedData.filter(p => p.salesPersonId === selectedPersonnelId);
    return data.sort((a, b) => b.signedContract - a.signedContract);
  }, [processedData, selectedPersonnelId]);

  const overallStats = useMemo(() => processedData.reduce((acc, curr) => {
    acc.totalLeads += curr.totalLeads;
    acc.signedContract += curr.signedContract;
    acc.currentOverdue += curr.currentOverdue;
    return acc;
  }, { totalLeads: 0, signedContract: 0, currentOverdue: 0 }), [processedData]);

  const overallConversionRate = overallStats.totalLeads > 0 ? (overallStats.signedContract / overallStats.totalLeads) * 100 : 0;

  const topPerformers = useMemo(() => 
    [...processedData].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 3),
    [processedData]
  );

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Bộ lọc báo cáo</CardTitle>
          <CardDescription>Lọc dữ liệu báo cáo theo thời gian và nhân viên.</CardDescription>
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
        <StatsCard title="Tổng Leads" value={overallStats.totalLeads.toString()} icon={Users} trend="up" trendValue="+15%" description="so với kỳ trước" className="bg-blue-50 border-blue-200" />
        <StatsCard title="Hợp đồng ký" value={overallStats.signedContract.toString()} icon={FileCheck} trend="up" trendValue="+20%" description="so với kỳ trước" className="bg-green-50 border-green-200" />
        <StatsCard title="Tỷ lệ chuyển đổi" value={`${overallConversionRate.toFixed(1)}%`} icon={Percent} trend="up" trendValue="+2.5%" description="so với kỳ trước" className="bg-purple-50 border-purple-200" />
        <StatsCard title="Leads quá hạn" value={overallStats.currentOverdue.toString()} icon={Clock} trend="down" trendValue="-5%" description="so với kỳ trước" className="bg-red-50 border-red-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full shadow-sm">
            <CardHeader>
              <CardTitle>Báo cáo chi tiết</CardTitle>
              <CardDescription>Phân tích chi tiết hiệu suất của từng nhân viên sale.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Tổng Leads</TableHead>
                    <TableHead>Hợp đồng</TableHead>
                    <TableHead>Tỷ lệ CĐ</TableHead>
                    <TableHead>Quá hạn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? renderSkeleton() : displayData.map(data => {
                    const user = salesPersonnel.find(p => p.id === data.salesPersonId);
                    return (
                      <TableRow key={data.salesPersonId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback>{data.salesPersonName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{data.salesPersonName}</p>
                              <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-center">{data.totalLeads}</TableCell>
                        <TableCell className="font-medium text-center">{data.signedContract}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={data.conversionRate} className="w-20 h-2" />
                            <span className="font-semibold text-muted-foreground">{data.conversionRate.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium text-red-600">{data.currentOverdue}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="text-amber-500" /> Top nhân viên sale</CardTitle>
              <CardDescription>Dựa trên tỷ lệ chuyển đổi cao nhất.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                topPerformers.map((perf, index) => (
                  <TopPerformer key={perf.salesPersonId} rank={index + 1} data={perf} personnel={salesPersonnel} />
                ))
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>So sánh hiệu suất</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={processedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="salesPersonName" stroke="#888888" fontSize={10} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false}/>
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ 
                      background: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: "var(--radius)",
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="totalLeads" name="Tổng Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="signedContract" name="Ký HĐ" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};