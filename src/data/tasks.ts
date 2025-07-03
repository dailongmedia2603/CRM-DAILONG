import { Personnel } from './personnel';

export interface FeedbackMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  version: string;
}

export interface Task {
  id: string;
  name: string;
  details: string;
  priority: 'Gấp' | 'Bình thường' | 'Thấp';
  deadline: string | null;
  status: 'Chưa làm' | 'Đang làm' | 'Hoàn thành';
  assigneeId: string | null;
  feedback: FeedbackMessage[];
  createdAt: string;
  completed: boolean;
}

export const tasksData: Task[] = [
  {
    id: 'TASK-001',
    name: 'Testing hệ thống CRM',
    details: 'Kiểm tra tất cả chức năng và tối ưu hiệu suất của hệ thống CRM mới trước khi ra mắt.',
    priority: 'Gấp',
    deadline: null,
    status: 'Đang làm',
    assigneeId: 'user-3',
    feedback: [
      { id: 'f1', userId: 'user-1', userName: 'Quản Trị Viên', message: 'Cần kiểm tra kỹ hơn ở module thanh toán nhé.', timestamp: '2025-06-13T17:08:00Z', version: 'v1' }
    ],
    createdAt: '2025-05-28T00:18:00Z',
    completed: false,
  },
  {
    id: 'TASK-002',
    name: 'Test Persistence Task 2025-06-15 08:48:32',
    details: 'Testing if task data persists correctly after application restart.',
    priority: 'Bình thường',
    deadline: '2025-12-31T07:00:00Z',
    status: 'Chưa làm',
    assigneeId: null,
    feedback: [],
    createdAt: '2025-06-15T08:48:32Z',
    completed: false,
  },
  {
    id: 'TASK-003',
    name: 'Thiết kế giao diện trang chủ',
    details: 'Tạo mockup và thiết kế UI cho trang chủ website theo yêu cầu mới của khách hàng.',
    priority: 'Bình thường',
    deadline: null,
    status: 'Hoàn thành',
    assigneeId: 'user-2',
    feedback: [],
    createdAt: '2025-06-10T10:00:00Z',
    completed: true,
  },
  {
    id: 'TASK-004',
    name: 'Lập trình module thanh toán',
    details: 'Tích hợp hơp gateway thanh toán VNPAY và MoMo vào website.',
    priority: 'Bình thường',
    deadline: '2025-07-20T18:00:00Z',
    status: 'Hoàn thành',
    assigneeId: 'user-3',
    feedback: [
      { id: 'f2', userId: 'user-1', userName: 'Quản Trị Viên', message: 'Đã test OK.', timestamp: '2025-07-19T11:20:00Z', version: 'v1' },
      { id: 'f3', userId: 'user-3', userName: 'Lê Hoàng Anh', message: 'Đã deploy lên staging.', timestamp: '2025-07-18T16:45:00Z', version: 'v1' }
    ],
    createdAt: '2025-06-25T09:30:00Z',
    completed: true,
  },
];