import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem I'll create a professional Agency CRM web application that can run efficiently on shared hosting with a modern UI. Let me walk you through the implementation using React with TypeScript and Tailwind CSS.

<dyad-write path="src/components/layout/MainLayout.tsx" description="Creating the main layout with sidebar navigation">
import { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Home, 
  Users, 
  Briefcase, 
  DollarSign, 
  GraduationCap, 
  ClipboardList, 
  BarChart2, 
  UserCog,
  X
} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isMobile ? "lg:translate-x-0" : ""
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="text-xl font-bold text-primary">Agency CRM</div>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem icon={<Home className="mr-3 h-5 w-5" />} href="/" label="Dashboard" />
            <NavItem icon={<Users className="mr-3 h-5 w-5" />} href="/clients" label="Clients" />
            <NavItem icon={<Briefcase className="mr-3 h-5 w-5" />} href="/projects" label="Projects" />
            
            <NavGroup label="Sales" icon={<DollarSign className="mr-3 h-5 w-5" />}>
              <NavItem href="/sales/leads" label="Leads" indent />
              <NavItem href="/sales/performance" label="Performance" indent />
            </NavGroup>
            
            <NavGroup label="Interns" icon={<GraduationCap className="mr-3 h-5 w-5" />}>
              <NavItem href="/interns/tasks" label="Task Assignment" indent />
              <NavItem href="/interns/reports" label="Reports" indent />
            </NavGroup>
            
            <NavItem icon={<ClipboardList className="mr-3 h-5 w-5" />} href="/tasks" label="Tasks" />
            <NavItem icon={<BarChart2 className="mr-3 h-5 w-5" />} href="/reports" label="Reports" />
            <NavItem icon={<UserCog className="mr-3 h-5 w-5" />} href="/hr" label="HR" />
          </nav>

          <div className="p-4 border-t">
            <MadeWithDyad />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1 flex justify-end">
              <div className="relative">
                <Button variant="outline" className="ml-2">
                  Admin
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ 
  icon, 
  href, 
  label, 
  indent = false 
}: { 
  icon?: React.ReactNode; 
  href: string; 
  label: string; 
  indent?: boolean;
}) => {
  return (
    <a 
      href={href} 
      className={cn(
        "flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors",
        indent && "ml-6"
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
};

// Navigation Group Component
const NavGroup = ({ 
  icon, 
  label, 
  children 
}: { 
  icon: React.ReactNode; 
  label: string; 
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className={`mt-1 ${open ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;