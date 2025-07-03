import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface PositionConfigTabProps {
  positions: string[];
  onPositionsChange: (newPositions: string[]) => void;
}

export const PositionConfigTab = ({ positions, onPositionsChange }: PositionConfigTabProps) => {
  const [newPosition, setNewPosition] = useState('');

  const handleAddPosition = () => {
    if (!newPosition.trim()) {
      showError('Vui lòng nhập tên vị trí.');
      return;
    }
    if (positions.map(p => p.toLowerCase()).includes(newPosition.trim().toLowerCase())) {
      showError('Vị trí này đã tồn tại.');
      return;
    }
    const updatedPositions = [...positions, newPosition.trim()];
    onPositionsChange(updatedPositions);
    setNewPosition('');
    showSuccess('Đã thêm vị trí mới.');
  };

  const handleDeletePosition = (positionToDelete: string) => {
    const updatedPositions = positions.filter(p => p !== positionToDelete);
    onPositionsChange(updatedPositions);
    showSuccess('Đã xóa vị trí.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình Vị trí Công việc</CardTitle>
        <CardDescription>Thêm hoặc xóa các vị trí công việc để sử dụng trong danh sách nhân sự.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
            placeholder="Nhập tên vị trí mới..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddPosition()}
          />
          <Button onClick={handleAddPosition}>
            <Plus className="mr-2 h-4 w-4" /> Thêm
          </Button>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Danh sách vị trí hiện có</h4>
          {positions.length > 0 ? (
            <ul className="space-y-2 rounded-md border p-2">
              {positions.map((pos, index) => (
                <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <span>{pos}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePosition(pos)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Chưa có vị trí nào được cấu hình.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};