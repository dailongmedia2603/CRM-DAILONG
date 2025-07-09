import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, DollarSign, Repeat } from "lucide-react";

const clientGrowthData = [
  { name: "Jan", "Khách hàng mới": 5 },
  { name: "Feb", "Khách hàng mới": 8 },
  { name: "Mar", "Khách hàng mới": 12 },
  { name: "Apr", "Khách hàng mới": 10 },
  { name: "May", "Khách hàng mới": 15 },
  { name: "Jun", "Khách hàng mới": 18 },
];

const topClients = [
  { name: "ABC Corporation", totalValue: "500,000,000đ", projects: 5 },
  { name: "Tech Innovators", totalValue: "350,000,000đ", projects: 3 },
  { name: "XYZ Inc", totalValue: "280,000,000đ", projects: 8 },
];

export const ClientsReport = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Tổng số Clients" value="85" icon={Users} />
        <StatsCard title="Clients mới (tháng)" value="18" icon={UserPlus} />
        <StatsCard title="Tổng giá trị HĐ" value="5,800,000,000đ" icon={DollarSign} />
        <StatsCard title="Tỷ lệ giữ chân" value="75%" icon={Repeat} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Tăng trưởng khách hàng"
          data={clientGrowthData}
          type="area"
          dataKey="Khách hàng mới"
          xAxis="name"
        />
        <Card>
          <CardHeader>
            <CardTitle>Top Clients theo giá trị</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Client</TableHead>
                  <TableHead>Tổng giá trị</TableHead>
                  <TableHead>Số dự án</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.totalValue}</TableCell>
                    <TableCell>{client.projects}</TableCell>
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