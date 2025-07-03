import { Personnel } from './personnel';

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: 'Gấp' | 'Bình thường' | 'Thấp';
  deadline: string | null;
  feedbackCount: number;
  status: 'Đang làm' | 'Chưa làm' | 'Hoàn thành' | 'Đã hủy';
  assigneeId: string | null;
  completed: boolean;
}

export const tasksData: Task[] = [
    {
        id: 'task-1',
        name: 'Testing hệ thống CRM',
        description: 'Kiểm tra tất cả chức năng và tối ưu hiệu suất',
        priority: 'Gấp',
        deadline: null,
        feedbackCount: 1,
        status: 'Đang làm',
        assigneeId: 'user-1',
        completed: false,
    },
    {
        id: 'task-2',
        name: 'Test Persistence Task 2025-06-15 08:48:32',
        description: 'Testing if task data persists correctly',
        priority: 'Bình thường',
        deadline: '2024-12-31T07:00:00.000Z',
        feedbackCount: 0,
        status: 'Chưa làm',
        assigneeId: null,
        completed: false,
    },
    {
        id: 'task-3',
        name: 'Thiết kế giao diện trang Dashboard',
        description: 'Tạo wireframe và mockup cho trang dashboard chính',
        priority: 'Bình thường',
        deadline: '2025-07-15T17:00:00.000Z',
        feedbackCount: 0,
        status: 'Chưa làm',
        assigneeId: 'user-2',
        completed: false,
    },
    {
        id: 'task-4',
        name: 'Fix bug đăng nhập',
        description: 'Người dùng không thể đăng nhập bằng tài khoản Google',
        priority: 'Gấp',
        deadline: '2025-07-03T17:00:00.000Z', // Overdue
        feedbackCount: 3,
        status: 'Đang làm',
        assigneeId: 'user-3',
        completed: false,
    },
    {
        id: 'task-5',
        name: 'Viết tài liệu API',
        description: 'Tài liệu hóa tất cả các endpoint của API cho team frontend',
        priority: 'Thấp',
        deadline: '2025-08-01T17:00:00.000Z',
        feedbackCount: 0,
        status: 'Hoàn thành',
        assigneeId: 'user-3',
        completed: true,
    },
];