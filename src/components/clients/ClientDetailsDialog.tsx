import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin } from "lucide-react";
import { Client } from "@/data/clients";
import { cn } from "@/lib/utils";

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export const ClientDetailsDialog = ({
  open,
  onOpenChange,
  client,
}: ClientDetailsDialogProps) => {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết Client</DialogTitle>
          <DialogDescription>Thông tin đầy đủ về client.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {client.image ? (
                <AvatarImage src={client.image} alt={client.name} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{client.name}</h3>
              <p className="text-muted-foreground">{client.company_name}</p>
            </div>
          </div>
          <div>
            <Badge
              variant="outline"
              className={cn(
                "text-sm",
                client.status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
              )}
            >
              {client.status}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
              <span className="text-sm">{client.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
              <span className="text-sm">{client.phone}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
              <span className="text-sm">{client.location}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};