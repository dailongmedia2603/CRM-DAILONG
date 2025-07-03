import { Project } from './clients';

const personnelData = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
  { id: "4", name: "Diana" },
];

export const projectsData: Project[] = [
  { id: "1", name: "Website Redesign", client: "ABC Corporation", progress: 75, createdAt: "2024-05-10", dueDate: "2024-08-15", status: "in-progress", team: [personnelData[0], personnelData[1]], contractValue: 120000000, payments: [{amount: 50000000, paid: true}, {amount: 40000000, paid: false}], link: "https://www.figma.com/", archived: false },
  { id: "2", name: "Marketing Campaign", client: "XYZ Industries", progress: 45, createdAt: "2024-06-01", dueDate: "2024-07-30", status: "in-progress", team: [personnelData[2]], contractValue: 85000000, payments: [{amount: 40000000, paid: false}], link: "https://www.figma.com/", archived: false },
  { id: "3", name: "Mobile App Dev", client: "Tech Innovators", progress: 100, createdAt: "2024-02-15", dueDate: "2024-06-20", status: "completed", team: [personnelData[0], personnelData[3]], contractValue: 350000000, payments: [{amount: 200000000, paid: true}, {amount: 150000000, paid: true}], link: "https://www.figma.com/", archived: false },
];