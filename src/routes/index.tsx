import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CompanyDashboard } from "../components/CompanyDashboard";
import { mockCompanyData, mockEvents, mockEmployees } from "../lib/mockData";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const navigate = useNavigate();
  
  const handleEmployeeClick = (employeeId: string) => {
    navigate({
      to: "/employee/$id",
      params: { id: employeeId }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CompanyDashboard 
        data={mockCompanyData} 
        events={mockEvents} 
        employees={mockEmployees}
        onEmployeeClick={handleEmployeeClick}
      />
    </div>
  );
}
