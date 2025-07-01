import { MainLayout } from "@/components/layout/MainLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import ChartCard from "@/components/dashboard/ChartCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import TasksList from "@/components/dashboard/TasksList";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Users, DollarSign, Briefcase, CheckCircle } from "lucide-react";

const Dashboard = () => {
  // Sample data for the dashboard
  const salesData = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 4800 },
    { name: "May", sales: 6000 },
    { name: "Jun", sales: 6500 },
  ];

  const leadsData = [
    { name: "Email", value: 35 },
    { name: "Social", value: 25 },
    { name: "Referral", value: 20 },
    { name: "Direct", value: 15 },
    { name: "Other", value: 5 },
  ];

  const projectsData = [
    {
      id: "1",
      name: "Website Redesign",
      client: "ABC Corporation",
      progress: 75,
      dueDate: "2025-08-15",
      status: "in-progress" as const,
      team: [
        { id: "1", name: "John Doe" },
        { id: "2", name: "Jane Smith" },
        { id: "3", name: "Mike Johnson" },
      ],
    },
    {
      id: "2",
      name: "Marketing Campaign",
      client: "XYZ Industries",
      progress: 45,
      dueDate: "2025-07-30",
      status: "in-progress" as const,
      team: [
        { id: "2", name: "Jane Smith" },
        { id: "4", name: "Sarah Williams" },
      ],
    },
    {
      id: "3",
      name: "Mobile App Development",
      client: "Tech Innovators",
      progress: 20,
      dueDate: "2025-09-10",
      status: "planning" as const,
      team: [
        { id: "1", name: "John Doe" },
        { id: "3", name: "Mike Johnson" },
        { id: "5", name: "Alex Brown" },
        { id: "6", name: "Emily Davis" },
      ],
    },
  ];

  const tasksData = [
    {
      id: "1",
      title: "Prepare client presentation",
      completed: false,
      priority: "high" as const,
      dueDate: "2025-07-03",
      assignee: {
        id: "1",
        name: "John Doe",
      },
    },
    {
      id: "2",
      title: "Review marketing materials",
      completed: true,
      priority: "medium" as const,
      dueDate: "2025-07-01",
      assignee: {
        id: "2",
        name: "Jane Smith",
      },
    },
    {
      id: "3",
      title: "Update project timeline",
      completed: false,
      priority: "medium" as const,
      dueDate: "2025-07-05",
      assignee: {
        id: "3",
        name: "Mike Johnson",
      },
    },
    {
      id: "4",
      title: "Send follow-up emails to leads",
      completed: false,
      priority: "low" as const,
      dueDate: "2025-07-04",
      assignee: {
        id: "2",
        name: "Jane Smith",
      },
    },
  ];

  const activitiesData = [
    {
      id: "1",
      user: {
        id: "1",
        name: "John Doe",
      },
      action: "created a new project",
      target: "Mobile App Development",
      targetType: "project" as const,
      timestamp: "2025-07-01T08:30:00",
    },
    {
      id: "2",
      user: {
        id: "2",
        name: "Jane Smith",
      },
      action: "added a new client",
      target: "Tech Innovators",
      targetType: "client" as const,
      timestamp: "2025-07-01T10:15:00",
    },
    {
      id: "3",
      user: {
        id: "3",
        name: "Mike Johnson",
      },
      action: "completed task",
      target: "Review marketing materials",
      targetType: "task" as const,
      timestamp: "2025-07-01T11:45:00",
    },
    {
      id: "4",
      user: {
        id: "2",
        name: "Jane Smith",
      },
      action: "converted lead to client",
      target: "Global Enterprises",
      targetType: "lead" as const,
      timestamp: "2025-06-30T16:20:00",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your agency's performance.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clients"
            value="36"
            trend="up"
            trendValue="12%"
            description="vs. last month"
            icon={Users}
          />
          <StatsCard
            title="Total Revenue"
            value="$84,292"
            trend="up"
            trendValue="8.2%"
            description="vs. last month"
            icon={DollarSign}
          />
          <StatsCard
            title="Active Projects"
            value="12"
            trend="up"
            trendValue="2"
            description="new this month"
            icon={Briefcase}
          />
          <StatsCard
            title="Task Completion"
            value="87%"
            trend="up"
            trendValue="5%"
            description="vs. last month"
            icon={CheckCircle}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title="Monthly Sales"
            subtitle="Last 6 months"
            data={salesData}
            type="area"
            dataKey="sales"
            xAxis="name"
            colors={["#3b82f6"]}
          />
          <ChartCard
            title="Lead Sources"
            subtitle="Current distribution"
            data={leadsData}
            type="pie"
            dataKey="value"
            colors={["#3b82f6", "#f59e0b", "#10b981", "#6366f1", "#ec4899"]}
          />
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projectsData.map(project => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>

        {/* Tasks and Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <TasksList tasks={tasksData} />
          <RecentActivity activities={activitiesData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;