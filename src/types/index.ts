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
  contact_person: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
  image?: string;
  contract_value: number;
  contract_link: string;
  creation_date: string;
  company_name: string;
  invoice_email: string;
  classification: 'Cá nhân' | 'Doanh nghiệp';
  source: 'Giới thiệu' | 'Website' | 'Sự kiện' | 'Khác';
  archived: boolean;
  profiles?: Profile[];
  folders?: ProfileFolder[];
}

export interface Payment {
  amount: number;
  paid: boolean;
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
  acceptance_link?: string;
  archived: boolean;
  created_at: string;
  payments: Payment[];
  team: { role: string; name: string; id: string }[];
}

export interface Personnel {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  position: string;
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
  work_link: string;
}

export interface LeadHistory {
    id: string;
    date: string;
    user: {
      id: string;
      name: string;
    };
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
    created_by: {
      id: string;
      name: string;
    };
    created_at: string;
    potential: "tiềm năng" | "không tiềm năng" | "chưa xác định";
    status: "đang làm việc" | "đang suy nghĩ" | "im ru" | "từ chối";
    result: "ký hợp đồng" | "chưa quyết định" | "từ chối" | "đang trao đổi";
    archived: boolean;
    history: LeadHistory[];
    next_follow_up_date?: string;
}