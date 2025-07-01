import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClientCardProps {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "inactive";
  image?: string;
  className?: string;
}

export const ClientCard = ({
  name,
  companyName,
  email,
  phone,
  location,
  status,
  image,
  className,
}: ClientCardProps) => {
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
          
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{location}</span>
          </div>
        </div>
        
        <div className="flex mt-6">
          <Button variant="outline" className="mr-2 w-full">Contact</Button>
          <Button className="w-full">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;