import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Search, Filter, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  dueDate: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  budget: string;
  team: Array<{
    id: string;
    name: string;
    image?: string;
  }>;
}

const ProjectsPage = () => {
  // Sample data for projects
  const projectsData: Project[] = [
    {
      id: "1",
      name: "Website Redesign",
      client: "ABC Corporation",
      progress: 75,
      dueDate: "2025-08-15",
      status: "in-progress",
      budget: "$12,000",
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
      status: "in-progress",
      budget: "$8,500",
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
      status: "planning",
      budget: "$35,000",
      team: [
        { id: "1", name: "John Doe" },
        { id: "3", name: "Mike Johnson" },
        { id: "5", name: "Alex Brown" },
        { id: "6", name: "Emily Davis" },
      ],
    },
    {
      id: "4",
      name: "Brand Identity Refresh",
      client: "Global Enterprises",
      progress: 90,
      dueDate: "2025-07-20",
      status: "in-progress",
      budget: "$15,000",
      team: [
        { id: "2", name: "Jane Smith" },
        { id: "7", name: "Daniel Wilson" },
      ],
    },
    {
      id: "5",
      name: "Content Marketing Strategy",
      client: "Creative Solutions",
      progress: 100,
      dueDate: "2025-06-30",
      status: "completed",
      budget: "$6,800",
      team: [
        { id: "4", name: "Sarah Williams" },
        { id: "8", name: "Lisa Martinez" },
      ],
    },
    {
      id: "6",
      name: "E-commerce Platform Migration",
      client: "Retail Experts",
      progress: 60,
      dueDate: "2025-08-25",
      status: "in-progress",
      budget: "$28,000",
      team: [
        { id: "1", name: "John Doe" },
        { id: "3", name: "Mike Johnson" },
        { id: "5", name: "Alex Brown" },
      ],
    },
    {
      id: "7",
      name: "SEO Optimization",
      client: "Digital Marketers",
      progress: 0,
      dueDate: "2025-09-05",
      status: "on-hold",
      budget: "$4,500",
      team: [
        { id: "8", name: "Lisa Martinez" },
      ],
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Filter projects based on search term and status filter
  const filteredProjects = projectsData.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and track your agency projects
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="18" x2="3" y2="18"></line>
              </svg>
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </Button>
          </div>
        </div>

        {/* Projects List View */}
        {viewMode === "list" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-2 p-4 bg-muted/50 text-sm font-medium">
                  <div className="col-span-5">Project & Client</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Due Date</div>
                  <div className="col-span-2 text-center">Team</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-muted/20 transition-colors">
                      <div className="col-span-5">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.client}</div>
                        <div className="flex items-center mt-2">
                          <div className="text-xs text-muted-foreground mr-2">Progress</div>
                          <Progress value={project.progress} className="h-2 flex-1 max-w-[100px]" />
                          <div className="text-xs font-medium ml-2">{project.progress}%</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge className={cn("rounded-full capitalize", getStatusColor(project.status))}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-center">
                        {formatDate(project.dueDate)}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <div className="flex -space-x-2">
                          {project.team.slice(0, 3).map((member) => (
                            <Avatar key={member.id} className="border-2 border-white h-8 w-8">
                              {member.image ? (
                                <AvatarImage src={member.image} alt={member.name} />
                              ) : (
                                <AvatarFallback>
                                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          ))}
                          {project.team.length > 3 && (
                            <Avatar className="border-2 border-white h-8 w-8">
                              <AvatarFallback>+{project.team.length - 3}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid View */}
        {viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                    <Badge className={cn("rounded-full capitalize", getStatusColor(project.status))}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Due Date</div>
                        <div className="font-medium">{formatDate(project.dueDate)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Budget</div>
                        <div className="font-medium">{project.budget}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Team</div>
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 4).map((member) => (
                          <Avatar key={member.id} className="border-2 border-white h-8 w-8">
                            {member.image ? (
                              <AvatarImage src={member.image} alt={member.name} />
                            ) : (
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        ))}
                        {project.team.length > 4 && (
                          <Avatar className="border-2 border-white h-8 w-8">
                            <AvatarFallback>+{project.team.length - 4}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectsPage;