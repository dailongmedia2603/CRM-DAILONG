import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZaloBotSettings } from "@/components/settings/ZaloBotSettings";
import { Bot } from "lucide-react";

const SettingsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt</h1>
          <p className="text-muted-foreground">Quản lý cài đặt và tích hợp hệ thống.</p>
        </div>
        
        <Tabs defaultValue="integrations" className="w-full">
          <TabsList>
            <TabsTrigger value="integrations">
              <Bot className="mr-2 h-4 w-4" />
              Tích hợp
            </TabsTrigger>
          </TabsList>
          <TabsContent value="integrations" className="mt-4">
            <ZaloBotSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;