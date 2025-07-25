import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ExternalLink, FolderPlus, Folder } from "lucide-react";
import { Client, Profile, ProfileFolder } from "@/types";
import { ProfileFormDialog } from "./ProfileFormDialog";
import { FolderFormDialog } from "./FolderFormDialog";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProfileListProps {
  client: Client;
  onUpdateClient: () => void;
}

export const ProfileList = ({ client, onUpdateClient }: ProfileListProps) => {
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isFolderFormOpen, setIsFolderFormOpen] = useState(() => sessionStorage.getItem('folderFormOpen') === 'true');
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);
  const [folderToEdit, setFolderToEdit] = useState<ProfileFolder | null>(() => {
    const saved = sessionStorage.getItem('folderToEdit');
    return saved ? JSON.parse(saved) : null;
  });
  const [defaultFolderId, setDefaultFolderId] = useState<string | null>(null);

  const { folders, profilesByFolder, uncategorizedProfiles } = useMemo(() => {
    const folders = client.folders || [];
    const profiles = client.profiles || [];
    const profilesByFolder = new Map<string, Profile[]>();
    const uncategorizedProfiles: Profile[] = [];

    profiles.forEach(profile => {
      if (profile.folder_id) {
        if (!profilesByFolder.has(profile.folder_id)) {
          profilesByFolder.set(profile.folder_id, []);
        }
        profilesByFolder.get(profile.folder_id)!.push(profile);
      } else {
        uncategorizedProfiles.push(profile);
      }
    });
    return { folders, profilesByFolder, uncategorizedProfiles };
  }, [client]);

  const handleOpenProfileForm = (profile?: Profile, folderId?: string | null) => {
    setProfileToEdit(profile || null);
    setDefaultFolderId(folderId === undefined ? (profile?.folder_id || null) : folderId);
    setIsProfileFormOpen(true);
  };

  const handleSetFolderFormOpen = (open: boolean) => {
    setIsFolderFormOpen(open);
    if (open) {
      sessionStorage.setItem('folderFormOpen', 'true');
    } else {
      sessionStorage.removeItem('folderFormOpen');
      sessionStorage.removeItem('folderToEdit');
      sessionStorage.removeItem('folderFormData');
    }
  };

  const handleOpenFolderForm = (folder?: ProfileFolder) => {
    setFolderToEdit(folder || null);
    if (folder) {
      sessionStorage.setItem('folderToEdit', JSON.stringify(folder));
    } else {
      sessionStorage.removeItem('folderToEdit');
    }
    handleSetFolderFormOpen(true);
  };

  const handleSaveFolder = async (name: string) => {
    if (folderToEdit) {
      const { error } = await supabase.from('profile_folders').update({ name }).eq('id', folderToEdit.id);
      if (error) showError("Lỗi khi cập nhật thư mục.");
      else showSuccess("Thư mục đã được cập nhật!");
    } else {
      const { error } = await supabase.from('profile_folders').insert([{ name, client_id: client.id }]);
      if (error) showError("Lỗi khi tạo thư mục.");
      else showSuccess("Đã tạo thư mục mới!");
    }
    onUpdateClient();
    handleSetFolderFormOpen(false);
  };

  const handleDeleteFolder = async (folderId: string) => {
    const { error } = await supabase.from('profile_folders').delete().eq('id', folderId);
    if (error) showError("Lỗi khi xóa thư mục.");
    else showSuccess("Đã xóa thư mục.");
    onUpdateClient();
  };

  const handleSaveProfile = async (profileData: Partial<Profile>) => {
    const { id, client_id, created_at, ...dataToSave } = profileData;
    if (id) {
      const { error } = await supabase.from('profiles').update(dataToSave).eq('id', id);
      if (error) showError("Lỗi khi cập nhật hồ sơ.");
      else showSuccess("Hồ sơ đã được cập nhật!");
    } else {
      const { error } = await supabase.from('profiles').insert([{ ...dataToSave, client_id: client.id }]);
      if (error) showError("Lỗi khi thêm hồ sơ mới.");
      else showSuccess("Hồ sơ mới đã được thêm!");
    }
    onUpdateClient();
  };

  const handleDeleteProfile = async (profileId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', profileId);
    if (error) showError("Lỗi khi xóa hồ sơ.");
    else showSuccess("Hồ sơ đã được xóa.");
    onUpdateClient();
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

  const renderProfileTable = (profiles: Profile[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TÊN HỒ SƠ</TableHead>
          <TableHead>LINK</TableHead>
          <TableHead>TRẠNG THÁI</TableHead>
          <TableHead>NGÀY TẠO</TableHead>
          <TableHead className="text-right">HÀNH ĐỘNG</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell className="font-medium">{profile.name}</TableCell>
            <TableCell><a href={profile.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center"><ExternalLink className="h-4 w-4 mr-1" />Xem</a></TableCell>
            <TableCell><Badge variant="outline">{profile.status}</Badge></TableCell>
            <TableCell>{formatDate(profile.created_at)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => handleOpenProfileForm(profile)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteProfile(profile.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hồ sơ</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenFolderForm()}>
            <FolderPlus className="mr-2 h-4 w-4" /> Thêm Thư mục
          </Button>
          <Button onClick={() => handleOpenProfileForm(undefined, null)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm Hồ sơ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full" defaultValue={folders.map(f => f.id)}>
          {uncategorizedProfiles.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-muted-foreground">Chưa phân loại</h3>
              {renderProfileTable(uncategorizedProfiles)}
            </div>
          )}
          {folders.map(folder => (
            <AccordionItem value={folder.id} key={folder.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">{folder.name}</span>
                  <Badge variant="secondary">{(profilesByFolder.get(folder.id) || []).length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-end gap-2 mb-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenFolderForm(folder)}>Đổi tên</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteFolder(folder.id)}>Xóa thư mục</Button>
                    <Button size="sm" onClick={() => handleOpenProfileForm(undefined, folder.id)}>Thêm hồ sơ vào đây</Button>
                  </div>
                  {renderProfileTable(profilesByFolder.get(folder.id) || [])}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {folders.length === 0 && uncategorizedProfiles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Chưa có hồ sơ hay thư mục nào.</div>
        )}
      </CardContent>
      <ProfileFormDialog
        open={isProfileFormOpen}
        onOpenChange={setIsProfileFormOpen}
        onSave={handleSaveProfile}
        profile={profileToEdit}
        folders={folders}
        defaultFolderId={defaultFolderId}
      />
      <FolderFormDialog
        open={isFolderFormOpen}
        onOpenChange={handleSetFolderFormOpen}
        onSave={handleSaveFolder}
        folder={folderToEdit}
      />
    </Card>
  );
};