import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import ClientCard from "@/components/clients/ClientCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search } from "lucide-react";

const ClientsPage = () => {
  // Sample data for clients
  const clientsData = [
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter clients based on search term and status filter
  const filteredClients = clientsData.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client relationships
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} {...client} />
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No clients found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ClientsPage;