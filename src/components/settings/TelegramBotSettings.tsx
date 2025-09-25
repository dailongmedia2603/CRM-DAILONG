import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Plus, Edit, Trash2, Bot, FileText } from 'lucide-react';
import { TelegramBot } from '@/types';
import { TelegramBotFormDialog } from './TelegramBotFormDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

export const TelegramBotSettings = () => {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [botToEdit, setBotToEdit] = useState<TelegramBot | null>(null);
  const [botToDelete, setBotToDelete] = useState<TelegramBot | null>(null);
  const [notificationBotId, setNotificationBotId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    const [botsRes, settingRes] = await Promise.all([
      supabase.from('telegram_bots').select('*').order('created_at'),
      supabase.from('settings').select('value').eq('key', 'telegram_notification_bot_id').single(),
    ]);

    if (botsRes.error) showError('Lỗi khi tải danh sách bot.');
    else setBots(botsRes.data);

    if (settingRes.data) setNotificationBotId(settingRes.data.value || '');
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenForm = (bot: TelegramBot | null) => {
    setBotToEdit(bot);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (bot: TelegramBot) => {
    setBotToDelete(bot);
  };

  const handleDeleteConfirm = async () => {
    if (!botToDelete) return;
    const { error } = await supabase.from('telegram_bots').delete().eq('id', botToDelete.id);
    if (error) {
      showError(`Lỗi khi xóa bot: ${error.message}`);
    } else {
      showSuccess('Đã xóa bot thành công.');
      fetchData();
    }
    setBotToDelete(null);
  };

  const handleSaveNotificationSetting = async () => {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'telegram_notification_bot_id', value: notificationBotId });
    if (error) {
      showError('Lỗi khi lưu cài đặt thông báo.');
    } else {
      showSuccess('Đã lưu cài đặt thông báo thành công!');
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cấu hình Telegram</CardTitle>
            <CardDescription>Quản lý các bot Telegram để gửi thông báo.</CardDescription>
          </div>
          <Button onClick={() => handleOpenForm(null)}>
            <Plus className="mr-2 h-4 w-4" /> Thêm cấu hình
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8" />
                    <div>
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-40 mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))
            ) : bots.length > 0 ? (
              bots.map(bot => (
                <div key={bot.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-semibold">{bot.name}</p>
                      <p className="text-sm text-muted-foreground">Chat ID: {bot.chat_id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(bot)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(bot)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="mx-auto h-12 w-12" />
                <p className="mt-4">Chưa có cấu hình bot nào.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông báo Seeding Hoàn Thành</CardTitle>
          <CardDescription>Chọn bot Telegram để nhận thông báo khi một mục trong Check Seeding hoàn thành.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Gửi thông báo qua Bot</Label>
            <Select value={notificationBotId} onValueChange={setNotificationBotId} disabled={isLoading || bots.length === 0}>
              <SelectTrigger className="w-full sm:w-[320px] mt-1">
                <SelectValue placeholder="Chọn một bot..." />
              </SelectTrigger>
              <SelectContent>
                {bots.map(bot => (
                  <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveNotificationSetting} disabled={isLoading}>Lưu cài đặt thông báo</Button>
        </CardContent>
      </Card>

      <TelegramBotFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={fetchData}
        bot={botToEdit}
      />

      <AlertDialog open={!!botToDelete} onOpenChange={() => setBotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Cấu hình "{botToDelete?.name}" sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};