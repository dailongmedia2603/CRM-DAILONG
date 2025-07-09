import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, Percent, TrendingUp } from "lucide-react";

const salesData = [
  { name: "Jan", "Doanh thu": 4000, "Leads": 24 },
  { name: "Feb", "Doanh thu": 3000, "Leads": 13 },
  { name: "Mar", "Doanh thu": 5000, "Leads": 98 },
  { name: "Apr", "Doanh thu": 4780, "Leads": 39 },
  { name: "May", "Doanh thu": 8890, "Leads": 48 },
  { name: "Jun", "Doanh thu": 7390, "Leads": 38 },
];

const topSales = [
  { name: "Nguyễn Văn A", leads: 120, conversion: "15%", revenue: "150,000,000đ" },
  { name: "Trần Thị B", leads: 98, conversion: "12%", revenue: "120,000,000đ" },
  { name: "Lê Văn C", leads: 85, conversion: "18%", revenue: "180,000,000đ" },
];

export const SalesReport = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Tổng doanh thu" value="1,250,000,000đ" icon={DollarSign} trend="up" trendValue="+12%" />
        <StatsCard title="Tổng số Leads" value="1,420" icon={Users} trend="up" trendValue="+8%" />
        <StatsCard title="Tỷ lệ chuyển đổi" value="14.5%" icon={Percent} trend="down" trendValue="-1.2%" />
        <StatsCard title="Doanh thu trung bình / Lead" value="880,281đ" icon={TrendingUp} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Tăng trưởng Doanh thu & Leads"
          data={salesData}
          type="line"
          dataKey="Doanh thu"
          xAxis="name"
        />
        <Card>
          <CardHeader>
            <CardTitle>Top Nhân viên Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Số Leads</TableHead>
                  <TableHead>Tỷ lệ chuyển đổi</TableHead>
                  <TableHead>Doanh thu mang về</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSales.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell>{sale.name}</TableCell>
                    <TableCell>{sale.leads}</TableCell>
                    <TableCell>{sale.conversion}</TableCell>
                    <TableCell>{sale.revenue}</TableCell>
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