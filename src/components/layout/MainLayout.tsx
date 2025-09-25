import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  Home, 
  Users, 
  Briefcase, 
  DollarSign, 
  GraduationCap, 
  FolderKanban, 
  BarChart2, 
  UserCog,
  X,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Wrench
} from "lucide-react";
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Can } from "@/components/auth/Can";
import { useAuth } from "@/context/AuthProvider";
import { useAbility } from "@/context/AbilityProvider";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Navigation Item Component (Upgraded)
const NavItem = ({ 
  icon, 
  href, 
  label, 
  active = false,
  external = false
}: { 
  icon?: React.ReactNode; 
  href: string; 
  label: string; 
  active?: boolean;
  external?: boolean;
}) => {
  const content = (
    <div className="flex items-center">
      {icon}
      <span>{label}</span>
    </div>
  );

  const className = cn(
    "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150",
    active 
      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  );

  if (external) {
    return (
      <a 
        href={href} 
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {content}
    </Link>
  );
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { can } = useAbility();

  const canViewReports = can('reports.sales.view') || can('reports.projects.view') || can('reports.interns.view') || can('reports.clients.view');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out border-r border-gray-200",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Agency CRM</div>
                <div className="text-xs text-gray-500">Professional Edition</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Can I="dashboard.view"><NavItem icon={<Home className="mr-3 h-5 w-5" />} href="/" label="Dashboard" active={pathname === "/"} /></Can>
            <Can I="clients.view"><NavItem icon={<Users className="mr-3 h-5 w-5" />} href="/clients" label="Clients" active={pathname.startsWith("/clients")} /></Can>
            <Can I="projects.view"><NavItem icon={<Briefcase className="mr-3 h-5 w-5" />} href="/projects" label="Dự án" active={pathname.startsWith("/projects")} /></Can>
            <Can I="leads.view"><NavItem icon={<DollarSign className="mr-3 h-5 w-5" />} href="/sales/leads" label="Quản lý sale" active={pathname.startsWith("/sales/leads")} /></Can>
            <Can I="intern_tasks.view"><NavItem icon={<GraduationCap className="mr-3 h-5 w-5" />} href="/interns" label="Thực tập sinh" active={pathname.startsWith("/interns")} /></Can>
            <NavItem icon={<Wrench className="mr-3 h-5 w-5" />} href="https://vsautomation.dailongmedia.io.vn/" label="Tool hỗ trợ" external={true} />
            <Can I="tasks.view"><NavItem icon={<FolderKanban className="mr-3 h-5 w-5" />} href="/task-management" label="Quản lý công việc" active={pathname.startsWith("/task-management")} /></Can>
            {canViewReports && <NavItem icon={<BarChart2 className="mr-3 h-5 w-5" />} href="/reports" label="Analytics & Reports" active={pathname.startsWith("/reports")} />}
            <Can I="hr.view"><NavItem icon={<UserCog className="mr-3 h-5 w-5" />} href="/hr" label="Nhân sự" active={pathname.startsWith("/hr")} /></Can>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-100">
            <Can I="permissions.view">
              <div className="mb-2">
                <NavItem icon={<Settings className="mr-3 h-5 w-5" />} href="/settings" label="Cài đặt" active={pathname.startsWith("/settings")} />
              </div>
            </Can>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/api/placeholder/40/40" alt="Admin User" />
                <AvatarFallback className="bg-blue-600 text-white">{session?.user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.email}</p>
                <p className="text-xs text-gray-500 truncate">Online</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          "lg:ml-64"
        )}
      >
        {/* Header */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem className="flex-col items-start p-4">
                      <div className="font-medium">New project assigned</div>
                      <div className="text-sm text-gray-500">You have been assigned to the ABC Corp website project</div>
                      <div className="text-xs text-gray-400 mt-1">2 minutes ago</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex-col items-start p-4">
                      <div className="font-medium">Client meeting reminder</div>
                      <div className="text-sm text-gray-500">Meeting with XYZ Industries in 30 minutes</div>
                      <div className="text-xs text-gray-400 mt-1">28 minutes ago</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex-col items-start p-4">
                      <div className="font-medium">Task deadline approaching</div>
                      <div className="text-sm text-gray-500">Complete client presentation by end of day</div>
                      <div className="text-xs text-gray-400 mt-1">1 hour ago</div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
                      <AvatarFallback className="bg-blue-600 text-white">{session?.user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block font-medium">{session?.user?.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{session?.user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;