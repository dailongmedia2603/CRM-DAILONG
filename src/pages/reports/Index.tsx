import { useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesReport } from "@/components/reports/SalesReport";
import { ProjectsReport } from "@/components/reports/ProjectsReport";
import { InternsReport } from "@/components/reports/InternsReport";
import { ClientsReport } from "@/components/reports/ClientsReport";
import { DollarSign, Briefcase, GraduationCap, Users } from "lucide-react";
import { Can } from "@/components/auth/Can";
import { useAbility } from "@/context/AbilityProvider";
import { useSearchParams } from "react-router-dom";

const ReportsPage = () => {
  const { can } = useAbility();
  const [searchParams, setSearchParams] = useSearchParams();
  const triggerClasses = "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-6 py-2 text-sm font-medium";

  const availableTabs = useMemo(() => {
    const tabs = [];
    if (can('reports.sales.view')) tabs.push('sales');
    if (can('reports.projects.view')) tabs.push('projects');
    if (can('reports.interns.view')) tabs.push('interns');
    if (can('reports.clients.view')) tabs.push('clients');
    return tabs;
  }, [can]);

  const activeTab = useMemo(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && availableTabs.includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return availableTabs[0];
  }, [searchParams, availableTabs]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo & Phân tích</h1>
          <p className="text-muted-foreground">
            Tổng quan về hiệu suất hoạt động của agency.
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="inline-flex h-auto rounded-full bg-gray-100 p-1.5">
            <Can I="reports.sales.view">
              <TabsTrigger value="sales" className={triggerClasses}>
                <DollarSign className="mr-2 h-4 w-4" />
                Báo cáo Sale
              </TabsTrigger>
            </Can>
            <Can I="reports.projects.view">
              <TabsTrigger value="projects" className={triggerClasses}>
                <Briefcase className="mr-2 h-4 w-4" />
                Báo cáo Dự án
              </TabsTrigger>
            </Can>
            <Can I="reports.interns.view">
              <TabsTrigger value="interns" className={triggerClasses}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Báo cáo Thực tập sinh
              </TabsTrigger>
            </Can>
            <Can I="reports.clients.view">
              <TabsTrigger value="clients" className={triggerClasses}>
                <Users className="mr-2 h-4 w-4" />
                Báo cáo Clients
              </TabsTrigger>
            </Can>
          </TabsList>
          <Can I="reports.sales.view">
            <TabsContent value="sales" className="mt-6">
              <SalesReport />
            </TabsContent>
          </Can>
          <Can I="reports.projects.view">
            <TabsContent value="projects" className="mt-6">
              <ProjectsReport />
            </TabsContent>
          </Can>
          <Can I="reports.interns.view">
            <TabsContent value="interns" className="mt-6">
              <InternsReport />
            </TabsContent>
          </Can>
          <Can I="reports.clients.view">
            <TabsContent value="clients" className="mt-6">
              <ClientsReport />
            </TabsContent>
          </Can>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;