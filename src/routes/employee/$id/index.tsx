import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EmployeePage } from "../../../components/EmployeePage";
import { mockEmployees } from "../../../lib/mockData";

export const Route = createFileRoute("/employee/$id/")({
  component: EmployeePageRoute,
});

function EmployeePageRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  
  // 해당 직원 정보 찾기
  const employee = mockEmployees.find(emp => emp.id === id);
  
  if (!employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">직원을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mt-2">요청하신 직원 정보가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  const handleDateClick = (date: string) => {
    console.log('Navigating to:', `/employee/${id}/day/${date}`);
    navigate({
      to: "/employee/$id/day/$date",
      params: { id, date }
    }).catch((error) => {
      console.error('Navigation error:', error);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EmployeePage 
        employee={employee} 
        onDateClick={handleDateClick}
      />
    </div>
  );
}
