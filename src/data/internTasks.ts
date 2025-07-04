export interface InternTask {
  id: string;
  title: string;
  description: string;
  internName: string;
  deadline: string;
  priority: 'Cao' | 'Bình thường' | 'Thấp';
  commentStatus: 'Đang làm' | 'Chờ xử lý' | 'Hoàn thành';
  postStatus: 'Đang làm' | 'Chờ xử lý' | 'Hoàn thành';
  fileCount: number;
  progressCount: number;
  fileLink: string;
}

export const internTasksData: InternTask[] = [
  {
    id: 'ITASK-001',
    title: 'Tạo báo cáo khách hàng tháng 12',
    description: 'Tổng hợp và phân tích dữ liệu khách hàng trong tháng 12 để đưa ra các đề xuất cải thiện.',
    internName: 'Nguyễn Văn A',
    deadline: '2024-12-15',
    priority: 'Cao',
    commentStatus: 'Đang làm',
    postStatus: 'Đang làm',
    fileCount: 8,
    progressCount: 3,
    fileLink: '#',
  },
  {
    id: 'ITASK-002',
    title: 'Cập nhật database khách hàng',
    description: 'Làm sạch và cập nhật thông tin liên lạc khách hàng từ file Excel mới nhất.',
    internName: 'Trần Thị B',
    deadline: '2024-12-20',
    priority: 'Bình thường',
    commentStatus: 'Chờ xử lý',
    postStatus: 'Chờ xử lý',
    fileCount: 3,
    progressCount: 1,
    fileLink: '#',
  },
  {
    id: 'ITASK-003',
    title: 'Nghiên cứu thị trường sản phẩm mới',
    description: 'Phân tích đối thủ cạnh tranh và xu hướng thị trường cho sản phẩm sắp ra mắt.',
    internName: 'Lê Văn C',
    deadline: '2024-12-25',
    priority: 'Thấp',
    commentStatus: 'Hoàn thành',
    postStatus: 'Hoàn thành',
    fileCount: 12,
    progressCount: 5,
    fileLink: '#',
  },
];