import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Terminal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const ZaloBotSettings = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'zalo_bot_token')
        .single();
      
      if (data) {
        setToken(data.value || '');
      }
      setIsLoading(false);
    };
    fetchToken();
  }, []);

  const handleSaveToken = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'zalo_bot_token', value: token });

    if (error) {
      showError('Lỗi khi lưu token: ' + error.message);
    } else {
      showSuccess('Đã lưu Zalo Bot Token thành công!');
    }
    setIsLoading(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus({ type: 'idle', message: '' });

    const { data, error } = await supabase.functions.invoke('test-zalo-connection');

    if (error) {
      setTestStatus({ type: 'error', message: error.message });
    } else if (data.error) {
      setTestStatus({ type: 'error', message: data.error });
    } else {
      setTestStatus({ type: 'success', message: data.message });
    }
    setIsTesting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tích hợp Zalo Bot</CardTitle>
        <CardDescription>
          Kết nối Zalo Bot của bạn để tự động hóa các tác vụ và tương tác.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="zalo-token">Zalo Bot Token</Label>
          <Input
            id="zalo-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456789:abc-xyz"
            disabled={isLoading}
          />
        </div>
        
        {testStatus.type !== 'idle' && (
          <Alert variant={testStatus.type === 'error' ? 'destructive' : 'default'} className={testStatus.type === 'success' ? 'bg-green-50 border-green-200' : ''}>
            {testStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{testStatus.type === 'success' ? 'Thành công' : 'Thất bại'}</AlertTitle>
            <AlertDescription>{testStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleSaveToken} disabled={isLoading || isTesting}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang lưu...' : 'Lưu Token'}
          </Button>
          <Button variant="outline" onClick={handleTestConnection} disabled={isLoading || isTesting}>
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};