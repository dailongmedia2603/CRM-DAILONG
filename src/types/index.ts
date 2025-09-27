export interface ProfileFolder {
  id: string;
  name: string;
  client_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  client_id: string;
  folder_id?: string | null;
  name: string;
  link: string;
  status: 'KH check' | 'Đã ký' | 'Đã Ship' | 'Hoàn thành';
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  status: 'active' | 'inactive' | null;
  image?: string;
  contract_value: number | null;
  contract_link: string | null;
  creation_date: string;
  company_name: string | null;
  invoice_email: string | null;
  classification: 'Cá nhân' | 'Doanh nghiệp' | null;
  source: 'Giới thiệu' | 'Website' | 'Sự kiện' | 'Khác' | null;
  industry: string | null;
  created_by: string | null;
  archived: boolean;
  profiles?: Profile[];
  folders?: ProfileFolder[];
}

export interface Payment {
  amount: number;
  paid: boolean;
  note?: string;
  personnel?: { id: string; name: string }[];
}

export interface WeeklyReport {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  status: string;
  issues: string;
  requests: string;
  created_at: string;
}

export interface AcceptanceHistory {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  client_name: string;
  client_id?: string;
  progress: number;
  start_date: string;
  end_date: string;
  status: 'planning' | 'in-progress' | 'completed' | 'overdue' | 'on-hold';
  contract_value: number;
  link: string;
  acceptance_link?: string | null;
  acceptance_status?: 'Cần làm BBNT' | 'Chờ xác nhận file' | 'Đã gởi bản cứng' | 'Đang chờ thanh toán' | 'Đã nhận tiền';
  archived: boolean;
  created_at: string;
  payments: Payment[];
  team: { role: string; name: string; id: string }[];
  weekly_reports?: WeeklyReport[];
  acceptance_history?: AcceptanceHistory[];
}

export interface AwaitingPaymentProject {
  id: string;
  name: string;
  client_name: string;
  contract_value: number;
  payment1_amount: number;
  created_at: string;
}

export interface Position {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Personnel {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  position: string;
  position_id?: string;
  role: 'BOD' | 'Quản lý' | 'Nhân viên' | 'Thực tập';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  links: string[];
  assigner: { id: string; name: string };
  assignee: { id: string; name: string };
  deadline: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  status: 'Chưa làm' | 'Đang làm' | 'Hoàn thành';
  feedbackHistory: Feedback[];
  created_at: string;
  archived: boolean;
}

export interface InternTask {
  id: string;
  title: string;
  description: string;
  intern_name: string;
  deadline: string;
  priority: 'Cao' | 'Bình thường' | 'Thấp';
  comment_status: 'Đang làm' | 'Chờ xử lý' | 'Hoàn thành';
  post_status: 'Đang làm' | 'Chờ xử lý' | 'Hoàn thành';
  comment_count: number;
  post_count: number;
  post_scan_count?: number;
  work_link: string;
  status: 'Chưa làm' | 'Đang làm' | 'Hoàn thành' | 'Quá hạn';
  started_at?: string;
  completed_at?: string;
  assigner_name?: string;
  archived?: boolean;
  created_at?: string;
  report_reason?: string;
}

export interface LeadHistory {
    id: string;
    date: string;
    user_id: string;
    user_name: string;
    content: string;
    type: "note" | "call" | "email" | "meeting";
    next_follow_up_date?: string;
    next_follow_up_content?: string;
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    product: string;
    created_by_id: string;
    created_by_name: string;
    created_at: string;
    potential: "tiềm năng" | "không tiềm năng" | "chưa xác định";
    status: "đang làm việc" | "đang suy nghĩ" | "im ru" | "từ chối";
    result: "ký hợp đồng" | "chưa quyết định" | "từ chối" | "đang trao đổi";
    archived: boolean;
    lead_history: LeadHistory[];
    next_follow_up_date?: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface TelegramBot {
  id: string;
  name: string;
  bot_token: string;
  chat_id: string;
  created_at: string;
}