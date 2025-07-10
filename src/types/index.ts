// HR & Personnel
export interface Position {
  id: number;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Personnel {
  id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  position_id?: number;
  status: 'Active' | 'Inactive';
  avatar?: string;
  created_at: string;
}

// Interns & Tasks
export interface InternTask {
  id: number;
  created_at?: string;
  title: string;
  description?: string;
  intern_name: string;
  assigner: string;
  assigner_name?: string;
  deadline: string;
  status: string;
  priority?: 'High' | 'Medium' | 'Low';
  post_count?: number;
  comment_count?: number;
  report_reason?: string;
  completed_at?: string;
  started_at?: string;
  work_link?: string;
  archived?: boolean;
}

// Clients & Profiles
export interface Client {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface ProfileFolder {
  id: string;
  name: string;
  client_id: string;
}

export interface Profile {
  id: string;
  name: string;
  url: string;
  folder_id: string;
}

// Projects
export interface Project {
  id: string;
  name: string;
  client_id: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  start_date: string;
  end_date: string;
}

// Sales & Leads
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Won';
  source: string;
  created_at: string;
}

export interface LeadHistory {
  id: string;
  lead_id: string;
  action: string;
  notes?: string;
  created_at: string;
}

// General Task Management
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id: string;
  project_id?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  due_date: string;
}

export interface Feedback {
  id: string;
  task_id: string;
  comment: string;
  author_id: string;
  created_at: string;
}