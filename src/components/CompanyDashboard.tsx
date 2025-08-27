import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Users, Building, Home, Coffee, Search } from "lucide-react";
import { CompanyDashboard as CompanyDashboardType, TeamAttendanceStats, CompanyEvent, Employee } from "@/types/employee";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface CompanyDashboardProps {
  data: CompanyDashboardType;
  events: CompanyEvent[];
  employees: Employee[];
  onEmployeeClick: (employeeId: string) => void;
}

export function CompanyDashboard({ data, events, employees, onEmployeeClick }: CompanyDashboardProps) {
  const [searchName, setSearchName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("전체");
  
  // 날짜 범위 설정 (기본: 지난 7일) - DateRange 형태로 변경
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: subDays(new Date(), 6),
    to: new Date()
  }));

  // 필터링된 직원 데이터 - 메모이제이션으로 최적화
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const nameMatch = employee.name.toLowerCase().includes(searchName.toLowerCase()) ||
                       employee.nickname.toLowerCase().includes(searchName.toLowerCase());
      const teamMatch = selectedTeam === "전체" || employee.team === selectedTeam;
      
      return nameMatch && teamMatch;
    });
  }, [employees, searchName, selectedTeam]);

  // 직원별 총 근무시간 계산 - 메모이제이션으로 최적화
  const getEmployeeTotalWorkHours = useCallback((employee: Employee) => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    
    const startDate = dateRange.from;
    const endDate = dateRange.to;
    
    const filteredRecords = employee.attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
    
    return filteredRecords.reduce((total, record) => total + record.totalWorkHours, 0);
  }, [dateRange]);

  const formatWorkHours = useCallback((hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}시간 ${m}분`;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">회사 전체 현황</h1>
        <div className="text-sm text-gray-500">
          실시간 업데이트 • {new Date().toLocaleString('ko-KR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 출근 인원</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.currentAttendance.office + data.currentAttendance.remote}
            </div>
            <p className="text-xs text-muted-foreground">
              전체 {data.totalEmployees}명 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사무실 근무</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.currentAttendance.office}
            </div>
            <p className="text-xs text-muted-foreground">
              여의도 {data.officeStats.여의도.present} • 샛강 {data.officeStats.샛강.present}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재택 근무</CardTitle>
            <Home className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.currentAttendance.remote}
            </div>
            <p className="text-xs text-muted-foreground">
              원격 근무 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">휴식/퇴근</CardTitle>
            <Coffee className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.currentAttendance.break + data.currentAttendance.off}
            </div>
            <p className="text-xs text-muted-foreground">
              휴식 {data.currentAttendance.break} • 퇴근 {data.currentAttendance.off}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>팀별 출근 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.teamStats.map((team) => (
                <TeamStatusRow key={team.teamName} team={team} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>회사 주요 일정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 라프티 개별 현황 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>라프티 개별 현황</CardTitle>
            
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* 날짜 범위 */}
              <DatePickerWithRange 
                date={dateRange} 
                onDateChange={setDateRange} 
              />
              
              {/* 이름 검색 */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="구성원 이름 또는 닉네임 검색..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              
              {/* 팀 필터 */}
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="팀 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="개발팀">개발팀</SelectItem>
                  <SelectItem value="디자인팀">디자인팀</SelectItem>
                  <SelectItem value="마케팅팀">마케팅팀</SelectItem>
                  <SelectItem value="기획팀">기획팀</SelectItem>
                  <SelectItem value="콘텐츠팀">콘텐츠팀</SelectItem>
                  <SelectItem value="인사팀">인사팀</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>구성원 이름</TableHead>
                <TableHead>소속 팀</TableHead>
                <TableHead className="text-right">총 근무시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const totalHours = getEmployeeTotalWorkHours(employee);
                return (
                  <TableRow key={employee.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell 
                      className="font-medium text-blue-600 hover:text-blue-800"
                      onClick={() => onEmployeeClick(employee.id)}
                    >
                      {employee.name}({employee.nickname})
                    </TableCell>
                    <TableCell>{employee.team}</TableCell>
                    <TableCell className="text-right">{formatWorkHours(totalHours)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              검색 조건에 맞는 구성원이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeamStatusRow({ team }: { team: TeamAttendanceStats }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="font-medium">{team.teamName}</div>
        <div className="text-sm text-muted-foreground">
          {team.totalMembers}명
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">{team.currentStatus.work}</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-sm">{team.currentStatus.break}</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm">{team.currentStatus.off}</span>
        </div>
      </div>
    </div>
  );
}

function EventItem({ event }: { event: CompanyEvent }) {
  const getEventColor = (type: CompanyEvent['type']) => {
    switch (type) {
      case '공휴일': return 'bg-red-100 text-red-800';
      case '워크샵': return 'bg-blue-100 text-blue-800';
      case '창립기념일': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
          {event.type}
        </div>
        <div>
          <div className="font-medium">{event.title}</div>
          <div className="text-sm text-muted-foreground">{event.date}</div>
        </div>
      </div>
    </div>
  );
}

