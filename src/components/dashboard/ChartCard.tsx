import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

type ChartType = "line" | "bar" | "area" | "pie";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  type: ChartType;
  dataKey: string;
  xAxis?: string;
  yAxis?: string;
  height?: number;
  colors?: string[];
  className?: string;
}

export const ChartCard = ({
  title,
  subtitle,
  data,
  type,
  dataKey,
  xAxis = "name",
  yAxis,
  height = 300,
  colors = ["#3b82f6"],
  className,
}: ChartCardProps) => {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {yAxis && <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />}
              <Tooltip 
                contentStyle={{ 
                  background: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" 
                }} 
              />
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <Line type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {yAxis && <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />}
              <Tooltip 
                contentStyle={{ 
                  background: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" 
                }} 
              />
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {yAxis && <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />}
              <Tooltip 
                contentStyle={{ 
                  background: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" 
                }} 
              />
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey={dataKey} stroke={colors[0]} fill="url(#colorGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
              />
              <Tooltip 
                contentStyle={{ 
                  background: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" 
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="p-6">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartCard;