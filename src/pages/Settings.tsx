import { MainLayout } from "@/components/layout/MainLayout";

const SettingsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground">Quản lý cài đặt hệ thống.</p>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;