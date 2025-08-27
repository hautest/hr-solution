import { createFileRoute } from "@tanstack/react-router";
import { DayDetailPage } from "../../../../components/DayDetailPage";
import { mockEmployees } from "../../../../lib/mockData";
import { AttendanceRecord } from "../../../../types/employee";

export const Route = createFileRoute("/employee/$id/day/$date")({
  component: EmployeeDayDetailRoute,
});

function EmployeeDayDetailRoute() {
  const { id, date } = Route.useParams();
  
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
  
  // 해당 날짜의 기록 찾기
  const record = employee.attendanceRecords.find(r => r.date === date);
  
  // 기록이 없으면 빈 기록 생성
  const defaultRecord: AttendanceRecord = {
    date,
    totalWorkHours: 0,
    totalBreakHours: 0,
    statusChanges: [],
    editHistory: []
  };

  const handleUpdateRecord = (updatedRecord: AttendanceRecord) => {
    console.log("Record updated:", updatedRecord);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DayDetailPage 
        employee={employee}
        record={record || defaultRecord}
        date={date}
        onUpdateRecord={handleUpdateRecord}
      />
    </div>
  );
}