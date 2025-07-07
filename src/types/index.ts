export interface Profile {
  id: string;
  client_id: string;
  name: string;
  link: string;
  status: 'KH check' | 'Đã ký' | 'Đã Ship' | 'Hoàn thành';
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
  image?: string;
  contractValue: number;
  contractLink: string;
  creationDate: string;
  companyName: string;
  invoiceEmail: string;
  classification: 'Cá nhân' | 'Doanh nghiệp';
  source: 'Giới thiệu' | 'Website' | 'Sự kiện' | 'Khác';
  archived: boolean;
  profiles?: Profile[];
}

export interface Payment {
  amount: number;
  paid: boolean;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  client_id?: string;
  progress: number;
  team: { id: string; name: string; image?: string }[];
  dueDate: string;
  status: 'planning' | 'in-progress' | 'completed' | 'overdue' | 'on-hold';
  contractValue: number;
  link: string;
  archived: boolean;
  createdAt: string;
  payments: Payment[];
}

export interface Personnel {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  position: string;
  role: 'BOD' | 'Quản lý' | 'Nhân viên' | 'Thực tập';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
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
  createdAt: string;
}

export interface InternTask {
  id: string;
  title: string;
  description: string;
  internName: string;
  deadline: string;
  priority: 'Cao' | 'Bình thường' | 'Thấp';
  commentStatus: 'Đang làm' | 'Chờ xử lý' | 'Hoàn thành';
  postStatus: 'Đang làm' | 'Chờ xử lý' | 'Hoàn thành';
  commentCount: number;
  postCount: number;
  workLink: string;
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
    nextFollowUpDate?: string;
    nextFollowUpContent?: string;
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    product: string;
    createdBy: {
      id: string;
      name: string;
    };
    createdAt: string;
    potential: "tiềm năng" | "không tiềm năng" | "chưa xác định";
    status: "đang làm việc" | "đang suy nghĩ" | "im ru" | "từ chối";
    result: "ký hợp đồng" | "chưa quyết định" | "từ chối" | "đang trao đổi";
    archived: boolean;
    history: LeadHistory[];
    nextFollowUpDate?: string;
}