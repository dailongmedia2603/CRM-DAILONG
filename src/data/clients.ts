export interface Profile {
  id: string;
  name: string;
  link: string;
  status: 'KH check' | 'Đã ký' | 'Đã Ship' | 'Hoàn thành';
  createdAt: string;
}

export interface Payment {
  amount: number;
  paid: boolean;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  createdAt: string;
  dueDate: string;
  status: "planning" | "in-progress" | "completed" | "overdue";
  team: { id: string; name: string; image?: string }[];
  contractValue: number;
  payments: Payment[];
  link: string;
  archived: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "inactive";
  image?: string;
  contractValue: number;
  contractLink: string;
  creationDate: string;
  companyName: string;
  invoiceEmail?: string;
  classification?: string;
  source?: string;
  profiles?: Profile[];
  archived?: boolean;
}

export const clientsData: Client[] = [
    {
      id: "1",
      name: "Updated Client Name",
      contactPerson: "John Doe",
      email: "john.doe@testclient.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      status: "active",
      contractValue: 0,
      contractLink: "#",
      creationDate: "2025-05-29",
      companyName: "Updated Client Name",
      invoiceEmail: "invoice@testclient.com",
      classification: "Cá nhân",
      source: "Giới thiệu",
      profiles: [
        { id: 'p1', name: 'Hợp đồng dịch vụ', link: '#', status: 'Đã ký', createdAt: '2025-06-15' },
        { id: 'p2', name: 'Biên bản nghiệm thu', link: '#', status: 'KH check', createdAt: '2025-07-01' },
      ],
      archived: false,
    },
    {
      id: "2",
      name: "XYZ Industries",
      contactPerson: "Sarah Johnson",
      email: "sarah.j@xyzindustries.com",
      phone: "+1 (555) 987-6543",
      location: "Chicago, USA",
      status: "active",
      contractValue: 150000,
      contractLink: "#",
      creationDate: "2025-04-15",
      companyName: "XYZ Industries",
      invoiceEmail: "billing@xyz.com",
      classification: "Doanh nghiệp",
      source: "Website",
      profiles: [],
      archived: false,
    },
];