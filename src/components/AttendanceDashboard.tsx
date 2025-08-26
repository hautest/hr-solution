import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { isWithinInterval, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/DateRangePicker";
import type { DateRange, AttendanceRecord } from "@/types/employee";
import { mockEmployees, teams } from "@/lib/mockData";
import { formatHours } from "@/lib/utils";

// Get current week's date range as default
const getThisWeekRange = (): DateRange => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() - today.getDay() + 6); // Saturday

  return {
    from: startOfWeek,
    to: endOfWeek,
  };
};

export function AttendanceDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("전체");
  const [dateRange, setDateRange] = useState<DateRange>(getThisWeekRange());

  const calculateHoursInRange = (
    records: AttendanceRecord[],
    range: DateRange
  ) => {
    if (!range.from || !range.to) return 0;

    return records
      .filter((record) => {
        const recordDate = parseISO(record.date);
        return isWithinInterval(recordDate, {
          start: range.from!,
          end: range.to!,
        });
      })
      .reduce((total, record) => total + record.totalWorkHours, 0);
  };

  const filteredEmployees = useMemo(() => {
    return mockEmployees
      .filter((employee) => {
        const matchesSearch =
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.nickname.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTeam =
          selectedTeam === "전체" || employee.team === selectedTeam;
        return matchesSearch && matchesTeam;
      })
      .sort((a, b) => {
        const totalA = calculateHoursInRange(a.attendanceRecords, dateRange);
        const totalB = calculateHoursInRange(b.attendanceRecords, dateRange);
        return totalB - totalA;
      });
  }, [searchQuery, selectedTeam, dateRange]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">통합 대시보드</h1>
        <p className="text-muted-foreground mt-2">
          전체 구성원의 근무 현황을 한눈에 파악하고, 개별 구성원의 상세 정보를
          확인하세요
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        <Input
          placeholder="구성원 이름 또는 닉네임 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="팀 선택" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">구성원 이름</TableHead>
              <TableHead>소속 팀</TableHead>
              <TableHead className="text-right">총 근무 시간</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-muted/50">
                <TableCell>
                  <Link
                    to="/employee/$id"
                    params={{ id: employee.id }}
                    className="font-medium hover:underline text-blue-600 cursor-pointer"
                  >
                    {employee.nickname}({employee.name})
                  </Link>
                </TableCell>
                <TableCell>{employee.team}</TableCell>
                <TableCell className="text-right font-mono text-md">
                  {formatHours(
                    calculateHoursInRange(employee.attendanceRecords, dateRange)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">검색 결과가 없습니다</p>
          <p className="text-sm mt-2">다른 검색어나 필터를 시도해보세요</p>
        </div>
      )}
    </div>
  );
}
