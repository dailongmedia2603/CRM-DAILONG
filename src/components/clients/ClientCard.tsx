import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Client } from "@/data/clients";

export interface ClientCardProps extends Client {
  className?: string;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewDetails: (client: Client) => void;
}

export const ClientCard = ({
  id,
  name,
  companyName,
  email,
  phone,
  location,
  status,
  image,
  className,
  onEdit,
  onDelete,
  onViewDetails,
}: ClientCardProps) => {
  const clientData = { id, name, companyName, email, phone, location, status, image };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              {image ? (
                <AvatarImage src={image} alt={name} />
              ) : (
                <AvatarFallback>
                  {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <h3 className="font-medium">{name}</h3>
              <p className="text-sm text-muted-foreground">{companyName}</p>
              <div className="mt-1">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs rounded-full",
                    status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
                  )}
                >
                  {status}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(clientData)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(clientData)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(clientData)} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <a href={`mailto:${email}`} className="hover:underline">{email}</a>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{location}</span>
          </div>
        </div>
        
        <div className="flex mt-6">
          <Button variant="outline" className="mr-2 w-full" asChild>
            <a href={`mailto:${email}`}>Contact</a>
          </Button>
          <Button className="w-full" onClick={() => onViewDetails(clientData)}>View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;