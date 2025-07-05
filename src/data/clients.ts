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
  contact_person: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "inactive";
  image?: string;
  contract_value: number;
  contract_link: string;
  creation_date: string;
  company_name: string;
  invoice_email?: string;
  classification?: string;
  source?: string;
  profiles?: Profile[];
  archived?: boolean;
}

export const clientsData: Client[] = [
    {
      id: "1",
      name: "Updated Client Name",
      contact_person: "John Doe",
      email: "john.doe@testclient.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      status: "active",
      contract_value: 0,
      contract_link: "#",
      creation_date: "2025-05-29",
      company_name: "Updated Client Name",
      invoice_email: "invoice@testclient.com",
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
      contact_person: "Sarah Johnson",
      email: "sarah.j@xyzindustries.com",
      phone: "+1 (555) 987-6543",
      location: "Chicago, USA",
      status: "active",
      contract_value: 150000,
      contract_link: "#",
      creation_date: "2025-04-15",
      company_name: "XYZ Industries",
      invoice_email: "billing@xyz.com",
      classification: "Doanh nghiệp",
      source: "Website",
      profiles: [],
      archived: false,
    },
];