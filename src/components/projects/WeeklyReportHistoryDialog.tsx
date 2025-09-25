import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WeeklyReport } from "@/types";
import { format } from "date-fns";
import { vi } from 'date-fns/locale';

interface WeeklyReportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  reports: WeeklyReport[];
}

const ReportDetail = ({ label, content }: { label: string; content?: string }) => (
  <div>
    <h4 className="font-semibold text-sm text-gray-700">{label}</h4>
    <p className="text-sm text-gray-600 whitespace-pre-wrap">{content || "Không có"}</p>
  </div>
);

export const WeeklyReportHistoryDialog = ({
  open,
  onOpenChange,
  projectName,
  reports,
}: WeeklyReportHistoryDialogProps) => {
  const sortedReports = [...reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lịch sử báo cáo: {projectName}</DialogTitle>
          <DialogDescription>
            Xem lại tất cả các báo cáo tuần đã gửi cho dự án này.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {sortedReports.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {sortedReports.map((report, index) => (
                <AccordionItem value={report.id} key={report.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span className="font-medium">Lần {sortedReports.length - index}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(report.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <ReportDetail label="Tình trạng" content={report.status} />
                    <ReportDetail label="Vấn đề" content={report.issues} />
                    <ReportDetail label="Mong muốn" content={report.requests} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Chưa có báo cáo nào cho dự án này.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};