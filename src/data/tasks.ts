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
  reportLink?: string;
  createdAt: string;
}

export const tasksData: Task[] = [
  {
    id: 'TASK-001',
    name: 'Thiết kế banner quảng cáo cho chiến dịch hè',
    description: 'Thiết kế bộ banner gồm 3 kích thước khác nhau cho Facebook Ads và Google Display Network. Yêu cầu: màu sắc tươi sáng, font chữ dễ đọc, có CTA rõ ràng.',
    links: ['https://www.figma.com/file/abc/'],
    assigner: { id: 'user-1', name: 'Nguyễn Văn Minh' },
    assignee: { id: 'user-2', name: 'Trần Thị Lan' },
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    priority: 'Cao',
    status: 'Chưa làm',
    feedbackHistory: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TASK-002',
    name: 'Viết 5 bài blog chuẩn SEO cho website',
    description: 'Nghiên cứu từ khóa và viết 5 bài blog, mỗi bài 1000 chữ. Chủ đề: Xu hướng marketing 2025.',
    links: [],
    assigner: { id: 'user-1', name: 'Nguyễn Văn Minh' },
    assignee: { id: 'user-4', name: 'Phạm Thị Thu' },
    deadline: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    priority: 'Trung bình',
    status: 'Đang làm',
    feedbackHistory: [
        { id: 'fb-1', userId: 'user-1', userName: 'Nguyễn Văn Minh', message: 'Em xem lại keyword density nhé.', timestamp: new Date().toISOString() }
    ],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
  {
    id: 'TASK-003',
    name: 'Fix bug giao diện trên mobile cho trang liên hệ',
    description: 'Form liên hệ bị vỡ layout trên màn hình iPhone 12 Pro.',
    links: ['https://example.com/contact'],
    assigner: { id: 'user-2', name: 'Trần Thị Lan' },
    assignee: { id: 'user-3', name: 'Lê Hoàng Anh' },
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    priority: 'Cao',
    status: 'Chưa làm',
    feedbackHistory: [],
    createdAt: new Date().toISOString(),
  },
];