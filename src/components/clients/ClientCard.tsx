import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Client } from "@/types";
import { Eye } from "lucide-react";

interface ClientCardProps {
  client: Client;
  contractValue: string;
  onViewDetails: (client: Client) => void;
}

export const ClientCard = ({ client, contractValue, onViewDetails }: ClientCardProps) => {
  return (
    <Card className="w-full" onClick={() => onViewDetails(client)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{client.name}</CardTitle>
        <Avatar className="h-8 w-8 bg-blue-100 text-blue-600">
          <AvatarFallback>{client.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          <p>Người liên hệ: {client.contact_person}</p>
          <p>Ngành: {client.industry || "N/A"}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Giá trị HĐ</p>
            <p className="text-lg font-bold">{contractValue}</p>
          </div>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onViewDetails(client); }}>
            <Eye className="mr-2 h-4 w-4" />
            Xem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};