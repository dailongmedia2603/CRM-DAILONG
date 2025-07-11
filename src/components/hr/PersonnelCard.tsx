import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Personnel } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Can } from "@/components/auth/Can";

interface PersonnelCardProps {
  personnel: Personnel;
  onEdit: (personnel: Personnel) => void;
  onDelete: (personnel: Personnel) => void;
}

export const PersonnelCard = ({ personnel, onEdit, onDelete }: PersonnelCardProps) => {
  const getRoleBadge = (role: Personnel['role']) => {
    switch (role) {
      case 'BOD': return "bg-red-100 text-red-800";
      case 'Quản lý': return "bg-purple-100 text-purple-800";
      case 'Nhân viên': return "bg-blue-100 text-blue-800";
      case 'Thực tập': return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={personnel.avatar} />
            <AvatarFallback>{personnel.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-medium">{personnel.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{personnel.email}</p>
          </div>
        </div>
        <Badge variant={personnel.status === 'active' ? 'default' : 'secondary'} className={cn("capitalize", personnel.status === 'active' ? 'bg-green-500' : '')}>
          {personnel.status === 'active' ? 'Hoạt động' : 'Ngừng'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Vị trí</p>
            <p className="font-medium">{personnel.position}</p>
            <Badge variant="outline" className={cn("capitalize mt-1", getRoleBadge(personnel.role))}>{personnel.role}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Can I="hr.edit">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-100" onClick={() => onEdit(personnel)}>
                <Edit className="h-4 w-4 text-green-600" />
              </Button>
            </Can>
            <Can I="hr.delete">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100" onClick={() => onDelete(personnel)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </Can>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};