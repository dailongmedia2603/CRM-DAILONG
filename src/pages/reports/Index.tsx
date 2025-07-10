import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesReport } from "@/components/reports/SalesReport";
import { ProjectsReport } from "@/components/reports/ProjectsReport";
import { InternsReport } from "@/components/reports/InternsReport";
import { ClientsReport } from "@/components/reports/ClientsReport";
import { DollarSign, Briefcase, GraduationCap, Users } from "lucide-react";

const ReportsPage = () => {
  const triggerClasses = "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-6 py-2 text-sm font-medium";

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo & Phân tích</h1>
          <p className="text-muted-foreground">
            Tổng quan về hiệu suất hoạt động của agency.
          </p>
        </div>
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="inline-flex h-auto rounded-full bg-gray-100 p-1.5">
            <TabsTrigger value="sales" className={triggerClasses}>
              <DollarSign className="mr-2 h-4 w-4" />
              Báo cáo Sale
            </TabsTrigger>
            <TabsTrigger value="projects" className={triggerClasses}>
              <Briefcase className="mr-2 h-4 w-4" />
              Báo cáo Dự án
            </TabsTrigger>
            <TabsTrigger value="interns" className={triggerClasses}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Báo cáo Thực tập sinh
            </TabsTrigger>
            <TabsTrigger value="clients" className={triggerClasses}>
              <Users className="mr-2 h-4 w-4" />
              Báo cáo Clients
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sales" className="mt-6">
            <SalesReport />
          </TabsContent>
          <TabsContent value="projects" className="mt-6">
            <ProjectsReport />
          </TabsContent>
          <TabsContent value="interns" className="mt-6">
            <InternsReport />
          </TabsContent>
          <TabsContent value="clients" className="mt-6">
            <ClientsReport />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;