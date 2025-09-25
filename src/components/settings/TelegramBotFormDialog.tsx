import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TelegramBot } from '@/types';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface TelegramBotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  bot?: TelegramBot | null;
}

export const TelegramBotFormDialog = ({ open, onOpenChange, onSave, bot }: TelegramBotFormDialogProps) => {
  const [formData, setFormData] = useState({ name: '', bot_token: '', chat_id: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

  useEffect(() => {
    if (open) {
      setFormData(bot ? { name: bot.name, bot_token: bot.bot_token, chat_id: bot.chat_id } : { name: '', bot_token: '', chat_id: '' });
      setTestStatus({ type: 'idle', message: '' });
    }
  }, [bot, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTest = async () => {
    if (!formData.bot_token || !formData.chat_id) {
      showError('Vui lòng nhập Bot Token và Chat ID để kiểm tra.');
      return;
    }
    setIsTesting(true);
    setTestStatus({ type: 'idle', message: '' });

    const { data, error } = await supabase.functions.invoke('test-telegram-connection', {
      body: { bot_token: formData.bot_token, chat_id: formData.chat_id },
    });

    if (error) {
      setTestStatus({ type: 'error', message: `Lỗi: ${error.message}` });
    } else if (data.error) {
      setTestStatus({ type: 'error', message: data.error });
    } else {
      setTestStatus({ type: 'success', message: data.message });
    }
    setIsTesting(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.bot_token || !formData.chat_id) {
      showError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setIsSaving(true);
    
    let error;
    if (bot) {
      ({ error } = await supabase.from('telegram_bots').update(formData).eq('id', bot.id));
    } else {
      ({ error } = await supabase.from('telegram_bots').insert([formData]));
    }

    if (error) {
      showError(`Lỗi khi lưu cấu hình: ${error.message}`);
    } else {
      showSuccess('Đã lưu cấu hình thành công!');
      onSave();
      onOpenChange(false);
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bot ? 'Chỉnh sửa cấu hình' : 'Thêm cấu hình mới'}</DialogTitle>
          <DialogDescription>Nhập thông tin bot Telegram của bạn.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên gợi nhớ</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Bot thông báo seeding" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bot_token">Bot Token</Label>
            <Input id="bot_token" name="bot_token" type="password" value={formData.bot_token} onChange={handleChange} placeholder="Nhập token từ BotFather" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chat_id">Chat ID</Label>
            <Input id="chat_id" name="chat_id" value={formData.chat_id} onChange={handleChange} placeholder="Nhập ID của nhóm hoặc người dùng" />
          </div>
          {testStatus.type !== 'idle' && (
            <Alert variant={testStatus.type === 'error' ? 'destructive' : 'default'} className={testStatus.type === 'success' ? 'bg-green-50 border-green-200' : ''}>
              {testStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{testStatus.type === 'success' ? 'Thành công' : 'Thất bại'}</AlertTitle>
              <AlertDescription>{testStatus.message}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleTest} disabled={isTesting || isSaving}>
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kiểm tra
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSaving || isTesting}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};