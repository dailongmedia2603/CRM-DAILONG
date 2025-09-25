import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZaloBotSettings } from "@/components/settings/ZaloBotSettings";
import { TelegramBotSettings } from "@/components/settings/TelegramBotSettings";
import { Bot, Send } from "lucide-react";

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
              Zalo Bot
            </TabsTrigger>
            <TabsTrigger value="telegram">
              <Send className="mr-2 h-4 w-4" />
              Telegram Bot
            </TabsTrigger>
          </TabsList>
          <TabsContent value="integrations" className="mt-4">
            <ZaloBotSettings />
          </TabsContent>
          <TabsContent value="telegram" className="mt-4">
            <TelegramBotSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;