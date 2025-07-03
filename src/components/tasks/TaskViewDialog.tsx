import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  description: string;
}

export const TaskViewDialog = ({ open, onOpenChange, taskName, description }: TaskViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{taskName}</DialogTitle>
          <DialogDescription>Chi tiết mô tả công việc.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow mt-4 pr-4">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: description }} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};