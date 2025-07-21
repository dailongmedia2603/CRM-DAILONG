import { MainLayout } from "@/components/layout/MainLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import ChartCard from "@/components/dashboard/ChartCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import TasksList from "@/components/dashboard/TasksList";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Users, DollarSign, Briefcase, CheckCircle, Calendar, TrendingUp, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  // Sample data for the dashboard
  const salesData = [
    { name: "Jan", sales: 4000, leads: 120 },
    { name: "Feb", sales: 3000, leads: 98 },
    { name: "Mar", sales: 5000, leads: 150 },
    { name: "Apr", sales: 4800, leads: 140 },
    { name: "May", sales: 6000, leads: 180 },
    { name: "Jun", sales: 6500, leads: 195 },
  ];

  const leadsData = [
    { name: "Email Marketing", value: 35, color: "#3b82f6" },
    { name: "Social Media", value: 25, color: "#10b981" },
    { name: "Referrals", value: 20, color: "#f59e0b" },
    { name: "Direct Traffic", value: 15, color: "#6366f1" },
    { name: "Other", value: 5, color: "#ec4899" },
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
  ];

  const upcomingMeetings = [
    {
      id: "1",
      title: "Client Review Meeting",
      time: "10:00 AM",
      date: "Today",
      participants: ["John Doe", "Jane Smith"],
      type: "client"
    },
    {
      id: "2", 
      title: "Team Standup",
      time: "2:00 PM",
      date: "Today",
      participants: ["All Team"],
      type: "internal"
    },
    {
      id: "3",
      title: "Project Kickoff",
      time: "9:00 AM",
      date: "Tomorrow",
      participants: ["Sarah Williams", "Mike Johnson"],
      type: "project"
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Section with Welcome Message */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Good morning, Admin! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here's what's happening with your agency today.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" size="sm" className="shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button variant="outline" size="sm" className="shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              3 Notifications
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value="$84,292"
            trend="up"
            trendValue="12.5%"
            description="vs. last month"
            icon={DollarSign}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-200"
          />
          <StatsCard
            title="Active Clients"
            value="36"
            trend="up"
            trendValue="8%"
            description="vs. last month"
            icon={Users}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200"
          />
          <StatsCard
            title="Running Projects"
            value="12"
            trend="up"
            trendValue="3"
            description="new this month"
            icon={Briefcase}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200"
          />
          <StatsCard
            title="Task Completion"
            value="87%"
            trend="up"
            trendValue="5%"
            description="vs. last month"
            icon={CheckCircle}
            className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-200"
          />
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard
              title="Revenue & Performance Trends"
              subtitle="Monthly overview of sales and lead generation"
              data={salesData}
              type="area"
              dataKey="sales"
              xAxis="name"
              colors={["#3b82f6"]}
              className="h-full shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200"
            />
          </div>
          <div>
            <ChartCard
              title="Lead Sources"
              subtitle="Where your leads come from"
              data={leadsData}
              type="pie"
              dataKey="value"
              colors={["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"]}
              className="h-full shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Projects Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Active Projects</h2>
              <Button variant="outline" size="sm" className="shadow-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                View All Projects
              </Button>
            </div>
            <div className="grid gap-4">
              {projectsData.map(project => (
                <ProjectCard 
                  key={project.id} 
                  {...project} 
                  className="hover:shadow-lg transition-all duration-200 border-gray-200" 
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center text-gray-900">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-150">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        meeting.type === 'client' ? 'bg-emerald-500' : 
                        meeting.type === 'internal' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {meeting.date} at {meeting.time}
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="flex -space-x-1">
                          {meeting.participants.slice(0, 2).map((participant, index) => (
                            <Avatar key={index} className="w-6 h-6 border-2 border-white">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                {participant.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {meeting.participants.length > 2 && (
                          <span className="text-xs text-gray-500 ml-2">
                            +{meeting.participants.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">This Week's Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">New Leads</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-16 h-2" />
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        +23
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Proposals Sent</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={60} className="w-16 h-2" />
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
                        8
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Calls Scheduled</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={90} className="w-16 h-2" />
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                        12
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Contracts Signed</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={50} className="w-16 h-2" />
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                        3
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-10" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Client
                </Button>
                <Button variant="outline" className="w-full justify-start h-10" size="sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
                <Button variant="outline" className="w-full justify-start h-10" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start h-10" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TasksList 
            tasks={tasksData} 
            className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200" 
          />
          <RecentActivity 
            activities={activitiesData} 
            className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200" 
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;