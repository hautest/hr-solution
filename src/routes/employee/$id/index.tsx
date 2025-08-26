import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/DateRangePicker";
import { RemoteWorkPattern } from "@/components/RemoteWorkPattern";
import type { DateRange } from "@/types/employee";
import { mockEmployees } from "@/lib/mockData";
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

export const Route = createFileRoute("/employee/$id/")({
  component: EmployeeDetail,
});

function EmployeeDetail() {
  const { id } = Route.useParams();
  const [dateRange, setDateRange] = useState<DateRange>(getThisWeekRange());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const employee = mockEmployees.find((emp) => emp.id === id);

  const filteredRecords = useMemo(() => {
    if (!employee || !dateRange.from || !dateRange.to) return [];

    return employee.attendanceRecords.filter((record) => {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, {
        start: dateRange.from!,
        end: dateRange.to!,
      });
    });
  }, [employee, dateRange]);

  const calendarMonthRecords = useMemo(() => {
    if (!employee) return [];
    
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    return employee.attendanceRecords.filter((record) => {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, {
        start: monthStart,
        end: monthEnd,
      });
    });
  }, [employee, selectedMonth]);

  const totalHours = filteredRecords.reduce(
    (sum, record) => sum + record.totalWorkHours,
    0
  );

  const calendarTotalHours = calendarMonthRecords.reduce(
    (sum, record) => sum + record.totalWorkHours,
    0
  );

  if (!employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">직원을 찾을 수 없습니다</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {employee.nickname}({employee.name})
          </h1>
          <p className="text-muted-foreground">{employee.team}</p>
        </div>
      </div>


      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">캘린더 뷰</TabsTrigger>
          <TabsTrigger value="table">테이블 뷰</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">월별 근무 현황</h3>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold">{formatHours(calendarTotalHours)}</p>
                  <p className="text-xs text-muted-foreground">이번 달 총 근무시간</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedMonth(
                        new Date(
                          selectedMonth.getFullYear(),
                          selectedMonth.getMonth() - 1
                        )
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-4 py-2 text-sm font-medium">
                    {format(selectedMonth, "yyyy년 M월", { locale: ko })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedMonth(
                        new Date(
                          selectedMonth.getFullYear(),
                          selectedMonth.getMonth() + 1
                        )
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground bg-muted rounded"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const monthStart = startOfMonth(selectedMonth);
                const monthEnd = endOfMonth(selectedMonth);
                const calendarStart = startOfWeek(monthStart, {
                  weekStartsOn: 0,
                });
                const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
                const calendarDays = eachDayOfInterval({
                  start: calendarStart,
                  end: calendarEnd,
                });

                return calendarDays.map((day) => {
                  const dayString = format(day, "yyyy-MM-dd");
                  const record = employee?.attendanceRecords.find(
                    (r) => r.date === dayString
                  );
                  const isCurrentMonth = isSameMonth(day, selectedMonth);
                  const isWorkDay = record?.statusChanges.some(
                    (change) =>
                      change.status === "work_office" ||
                      change.status === "work_remote"
                  );
                  const workLocation =
                    record?.statusChanges.find(
                      (change) =>
                        change.status === "work_office" ||
                        change.status === "work_remote"
                    )?.status === "work_office"
                      ? "사무실"
                      : "원격";

                  return (
                    <div
                      key={dayString}
                      className={`p-2 border rounded min-h-[80px] flex flex-col justify-between ${
                        !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                      } ${record ? "hover:bg-muted/50 cursor-pointer transition-colors" : ""}`}
                    >
                      {record ? (
                        <Link
                          to="/employee/$id/work/$date"
                          params={{
                            id: employee!.id as string,
                            date: dayString as string,
                          }}
                          className="h-full flex flex-col justify-between"
                        >
                          <div className="text-sm font-medium">
                            {format(day, "d")}
                          </div>
                          {isWorkDay && (
                            <div className="text-xs space-y-1">
                              <div className="text-blue-600 font-medium">
                                {formatHours(record.totalWorkHours)}
                              </div>
                              <div
                                className={`text-xs px-1 py-0.5 rounded ${
                                  workLocation === "사무실"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {workLocation}
                              </div>
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="text-sm font-medium">
                          {format(day, "d")}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
              <div className="text-right">
                <p className="text-2xl font-bold">{formatHours(totalHours)}</p>
                <p className="text-sm text-muted-foreground">총 근무시간</p>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>근무 위치</TableHead>
                    <TableHead className="text-right">근무 시간</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const workLocation =
                      record.statusChanges.find(
                        (change) =>
                          change.status === "work_office" ||
                          change.status === "work_remote"
                      )?.status === "work_office"
                        ? "사무실"
                        : "원격 근무";

                    return (
                      <TableRow key={record.date} className="hover:bg-muted/50">
                        <TableCell>
                          <Link
                            to="/employee/$id/work/$date"
                            params={{
                              id: employee!.id as string,
                              date: record.date as string,
                            }}
                            className="font-medium hover:underline text-blue-600 cursor-pointer"
                          >
                            {format(parseISO(record.date), "yyyy/MM/dd", {
                              locale: ko,
                            })}
                          </Link>
                        </TableCell>
                        <TableCell>{workLocation}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatHours(record.totalWorkHours)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">근무 위치 통계</h3>
                <RemoteWorkPattern
                  records={filteredRecords}
                  dateRange={dateRange}
                />
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">근무 시간 통계</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">총 근무 시간</span>
                    <span className="font-mono text-lg font-semibold">
                      {formatHours(totalHours)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      평균 일일 근무 시간
                    </span>
                    <span className="font-mono">
                      {filteredRecords.length > 0
                        ? formatHours(totalHours / filteredRecords.length)
                        : "0시간"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">총 근무 일수</span>
                    <span className="font-mono">
                      {filteredRecords.length}일
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
