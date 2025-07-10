import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { InternTask, Personnel } from "@/types";
import { useAuth } from "@/integrations/auth/AuthContext";

const taskSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  intern_name: z.string().min(1, "Vui lòng chọn thực tập sinh"),
  deadline: z.date({ required_error: "Vui lòng chọn ngày hết hạn" }),
  post_count: z.number().optional(),
  comment_count: z.number().optional(),
  report_reason: z.string().optional(),
});

export const InternsPage = () => {
  const [tasks, setTasks] = useState<InternTask[]>([]);
  const [interns, setInterns] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<InternTask | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
  });

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("intern_tasks").select("*").order("created_at", { ascending: false });
    if (data) setTasks(data);
  };

  const fetchInterns = async () => {
    const { data, error } = await supabase.from("personnel").select("*").eq("role", "Thực tập");
    if (data) setInterns(data);
  };

  useEffect(() => {
    fetchTasks();
    fetchInterns();
  }, []);

  const handleSaveTask = async (data: z.infer<typeof taskSchema>) => {
    const taskData = {
      ...data,
      deadline: format(data.deadline, "yyyy-MM-dd"),
      assigner: user?.user_metadata?.full_name || user?.email, // FIX: Set assigner to current user
    };

    let error;
    if (editingTask) {
      const { error: updateError } = await supabase.from("intern_tasks").update(taskData).eq("id", editingTask.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("intern_tasks").insert([{ ...taskData, status: "Đang thực hiện" }]);
      error = insertError;
    }

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Thành công", description: `Đã ${editingTask ? 'cập nhật' : 'tạo'} công việc.` });
      fetchTasks();
      setIsDialogOpen(false);
      setEditingTask(null);
    }
  };

  const handleOpenDialog = (task: InternTask | null = null) => {
    setEditingTask(task);
    if (task) {
      form.reset({
        title: task.title,
        intern_name: task.intern_name,
        deadline: new Date(task.deadline),
        post_count: task.post_count || undefined,
        comment_count: task.comment_count || undefined,
        report_reason: task.report_reason || undefined,
      });
    } else {
      form.reset({
        title: "",
        intern_name: "",
        deadline: undefined,
        post_count: undefined,
        comment_count: undefined,
        report_reason: "",
      });
    }
    setIsDialogOpen(true);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.intern_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Công việc Thực tập sinh</h1>
        <Button onClick={() => handleOpenDialog()}>Thêm công việc</Button>
      </div>
      <Input
        placeholder="Tìm kiếm công việc..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Thực tập sinh</TableHead>
            <TableHead>Người giao</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.intern_name}</TableCell>
              <TableCell>{task.assigner}</TableCell>
              <TableCell>{format(new Date(task.deadline), "dd/MM/yyyy")}</TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(task)}>Sửa</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Sửa công việc" : "Thêm công việc mới"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveTask)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Tiêu đề</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="intern_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Thực tập sinh</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn thực tập sinh" /></SelectTrigger></FormControl>
                    <SelectContent>{interns.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="deadline" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Chọn ngày</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="post_count" render={({ field }) => (<FormItem><FormLabel>Số lượng Post</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="comment_count" render={({ field }) => (<FormItem><FormLabel>Số lượng Comment</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
              {editingTask && <FormField control={form.control} name="report_reason" render={({ field }) => (<FormItem><FormLabel>Lý do báo cáo (nếu có)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />}
              <Button type="submit">Lưu</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};