export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "inactive";
  image?: string;
}

export const clientsData: Client[] = [
    {
      id: "1",
      name: "John Smith",
      companyName: "ABC Corporation",
      email: "john.smith@abccorp.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      status: "active" as const,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      companyName: "XYZ Industries",
      email: "sarah.j@xyzindustries.com",
      phone: "+1 (555) 987-6543",
      location: "Chicago, USA",
      status: "active" as const,
    },
    {
      id: "3",
      name: "Michael Chen",
      companyName: "Tech Innovators",
      email: "mchen@techinnovators.com",
      phone: "+1 (555) 456-7890",
      location: "San Francisco, USA",
      status: "active" as const,
    },
    {
      id: "4",
      name: "Emily Davis",
      companyName: "Global Enterprises",
      email: "e.davis@globalent.com",
      phone: "+1 (555) 234-5678",
      location: "Boston, USA",
      status: "inactive" as const,
    },
    {
      id: "5",
      name: "David Wilson",
      companyName: "Creative Solutions",
      email: "david.w@creativesol.com",
      phone: "+1 (555) 876-5432",
      location: "Austin, USA",
      status: "active" as const,
    },
    {
      id: "6",
      name: "Lisa Martinez",
      companyName: "Marketing Masters",
      email: "lisa.m@marketingmasters.com",
      phone: "+1 (555) 345-6789",
      location: "Miami, USA",
      status: "active" as const,
    },
];