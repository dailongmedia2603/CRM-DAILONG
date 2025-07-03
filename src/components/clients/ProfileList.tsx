import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Client, Profile } from "@/data/clients";
import { ProfileFormDialog } from "./ProfileFormDialog";
import { showSuccess } from "@/utils/toast";

interface ProfileListProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
}

export const ProfileList = ({ client, onUpdateClient }: ProfileListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);

  const handleOpenForm = (profile?: Profile) => {
    setProfileToEdit(profile || null);
    setIsFormOpen(true);
  };

  const handleSaveProfile = (profileToSave: Profile) => {
    const existingProfiles = client.profiles || [];
    let updatedProfiles;

    if (existingProfiles.some(p => p.id === profileToSave.id)) {
      updatedProfiles = existingProfiles.map(p => p.id === profileToSave.id ? profileToSave : p);
      showSuccess("Hồ sơ đã được cập nhật!");
    } else {
      updatedProfiles = [...existingProfiles, profileToSave];
      showSuccess("Hồ sơ mới đã được thêm!");
    }
    
    onUpdateClient({ ...client, profiles: updatedProfiles });
  };

  const handleDeleteProfile = (profileId: string) => {
    const updatedProfiles = (client.profiles || []).filter(p => p.id !== profileId);
    onUpdateClient({ ...client, profiles: updatedProfiles });
    showSuccess("Hồ sơ đã được xóa.");
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hồ sơ</CardTitle>
        <Button onClick={() => handleOpenForm()} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Thêm Hồ sơ
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TÊN HỒ SƠ</TableHead>
              <TableHead>LINK HỒ SƠ</TableHead>
              <TableHead>TRẠNG THÁI</TableHead>
              <TableHead>THỜI GIAN TẠO</TableHead>
              <TableHead>HÀNH ĐỘNG</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(client.profiles || []).map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.name}</TableCell>
                <TableCell>
                  <a href={profile.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Xem hồ sơ
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{profile.status}</Badge>
                </TableCell>
                <TableCell>{formatDate(profile.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(profile)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProfile(profile.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(!client.profiles || client.profiles.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
                Chưa có hồ sơ nào.
            </div>
        )}
      </CardContent>
      <ProfileFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveProfile}
        profile={profileToEdit}
      />
    </Card>
  );
};