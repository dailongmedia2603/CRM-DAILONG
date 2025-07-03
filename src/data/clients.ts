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
  companyName: string; // Giữ lại để tương thích với form dự án
}

export const clientsData: Client[] = [
    {
      id: "1",
      name: "Updated Client Name",
      contactPerson: "John Doe",
      email: "john.smith@abccorp.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      status: "active",
      contractValue: 200000,
      contractLink: "#",
      creationDate: "2025-05-29",
      companyName: "ABC Corporation",
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
    },
];