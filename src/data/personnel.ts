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

export const personnelData: Personnel[] = [
  {
    id: 'user-1',
    name: 'Nguyễn Văn Minh',
    email: 'minh.nv@agency.com',
    position: 'Project Manager',
    role: 'BOD',
    status: 'active',
    createdAt: '2023-01-15',
  },
  {
    id: 'user-2',
    name: 'Trần Thị Lan',
    email: 'lan.tt@agency.com',
    position: 'Lead Designer',
    role: 'Quản lý',
    status: 'active',
    createdAt: '2023-02-20',
  },
  {
    id: 'user-3',
    name: 'Lê Hoàng Anh',
    email: 'anh.lh@agency.com',
    position: 'Senior Developer',
    role: 'Nhân viên',
    status: 'active',
    createdAt: '2023-03-10',
  },
  {
    id: 'user-4',
    name: 'Phạm Thị Thu',
    email: 'thu.pt@agency.com',
    position: 'Marketing Specialist',
    role: 'Nhân viên',
    status: 'inactive',
    createdAt: '2023-04-05',
  },
  {
    id: 'user-5',
    name: 'Vũ Đức Thắng',
    email: 'thang.vd@agency.com',
    position: 'Intern Developer',
    role: 'Thực tập',
    status: 'active',
    createdAt: '2024-06-01',
  },
];