import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}

export const DescriptionDialog = ({ open, onOpenChange, title, description }: DescriptionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 prose prose-sm max-w-none">
          <p>{description || "Không có mô tả."}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};