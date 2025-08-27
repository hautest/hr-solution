import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  List,
} from "lucide-react";
import { Employee, AttendanceRecord, WorkStatus } from "@/types/employee";
import { formatHours } from "@/lib/utils";
import {
  format,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  addMonths,
  subMonths,
  getDaysInMonth,
  getDay,
  isToday,
  isSameDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface EmployeePageProps {
  employee: Employee;
  onDateClick: (date: string) => void;
}

export function EmployeePage({ employee, onDateClick }: EmployeePageProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  }));
  const weeklyScrollRef = useRef<HTMLDivElement>(null);

  // 주간 캘린더가 처음 렌더링될 때만 06시로 스크롤
  useEffect(() => {
    if (weeklyScrollRef.current) {
      // 06시 위치로 스크롤 (6 * 64px)
      weeklyScrollRef.current.scrollTop = 6 * 64;
    }
  }, []); // 빈 의존성 배열로 최초 1회만 실행

  const getRecordForDate = useMemo(() => {
    return (date: Date): AttendanceRecord | undefined => {
      const dateStr = format(date, "yyyy-MM-dd");
      return employee.attendanceRecords.find((record) => record.date === dateStr);
    };
  }, [employee.attendanceRecords]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick(format(date, "yyyy-MM-dd"));
  };

  const getStatusColor = (status: WorkStatus) => {
    switch (status) {
      case "여의도_출근":
      case "샛강_출근":
        return "bg-blue-100 text-blue-800";
      case "재택_출근":
        return "bg-green-100 text-green-800";
      case "외근":
        return "bg-purple-100 text-purple-800";
      case "휴식":
      case "식사":
        return "bg-yellow-100 text-yellow-800";
      case "퇴근":
        return "bg-gray-100 text-gray-800";
      case "연차":
      case "반차":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayName = (status: WorkStatus) => {
    const statusMap: Record<WorkStatus, string> = {
      여의도_출근: "사무실",
      샛강_출근: "사무실",
      재택_출근: "재택",
      외근: "외근",
      복귀: "복귀",
      휴식: "휴식",
      식사: "식사",
      퇴근: "퇴근",
      연차: "연차",
      반차: "반차",
    };
    return statusMap[status] || status;
  };

  // 월간 캘린더 렌더링
  const MonthlyCalendar = () => {
    const calendarData = useMemo(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const startDay = getDay(firstDayOfMonth); // 일요일 시작
      const daysInMonth = getDaysInMonth(currentDate);

      const days = [];
      
      // 이전 달의 날짜들
      for (let i = 0; i < startDay; i++) {
        const date = subDays(firstDayOfMonth, startDay - i);
        days.push({ date, isCurrentMonth: false });
      }

      // 현재 달의 날짜들
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push({ date, isCurrentMonth: true });
      }

      // 다음 달의 날짜들 (6주 42칸 맞추기)
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({ date, isCurrentMonth: false });
      }

      return days;
    }, [currentDate]);

    const days = calendarData;

    const totalWorkHours = useMemo(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      return employee.attendanceRecords
        .filter((record) => {
          const recordDate = new Date(record.date);
          return (
            recordDate.getMonth() === month && recordDate.getFullYear() === year
          );
        })
        .reduce((sum, record) => sum + record.totalWorkHours, 0);
    }, [currentDate, employee.attendanceRecords]);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">월별 근무 현황</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                이번 달 총 근무시간
              </div>
              <div className="text-xl font-bold text-blue-600">
                {formatHours(totalWorkHours)}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[120px] text-center font-semibold">
                  {format(currentDate, "yyyy년 M월", { locale: ko })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* 요일 헤더 */}
            {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
              <div
                key={index}
                className="p-2 text-center text-sm font-medium text-gray-500 border-b"
              >
                {day}
              </div>
            ))}

            {/* 날짜 셀들 */}
            {days.map((dayInfo, index) => {
              const record = getRecordForDate(dayInfo.date);
              const isSelected = isSameDay(dayInfo.date, selectedDate);
              const isTodayDate = isToday(dayInfo.date);

              return (
                <div
                  key={index}
                  className={`
                    min-h-[130px] p-2 border cursor-pointer hover:bg-gray-50 transition-colors
                    ${!dayInfo.isCurrentMonth ? "bg-gray-50 text-gray-400" : ""}
                    ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                    ${isTodayDate ? "bg-yellow-50 border-yellow-300" : ""}
                  `}
                  onClick={() =>
                    dayInfo.isCurrentMonth && handleDateClick(dayInfo.date)
                  }
                >
                  <div className="text-sm font-medium mb-1">
                    {dayInfo.date.getDate()}
                  </div>
                  {record && dayInfo.isCurrentMonth && (
                    <div className="space-y-1">
                      <div className="text-xs text-blue-600 font-medium">
                        {record.totalWorkHours.toFixed(1)}시간
                      </div>
                      {record.statusChanges.length > 0 && (
                        <div
                          className={`text-xs px-1 py-0.5 rounded ${getStatusColor(record.statusChanges[0].status)}`}
                        >
                          {getStatusDisplayName(record.statusChanges[0].status)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 주간 캘린더 렌더링
  const WeeklyCalendar = () => {
    const startOfWeekDate = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate]);
    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) =>
      addDays(startOfWeekDate, i)
    ), [startOfWeekDate]);



    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">주간 근무 현황</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subDays(currentDate, 7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[200px] text-center font-semibold">
                {format(startOfWeekDate, "M월 d일", { locale: ko })} -{" "}
                {format(addDays(startOfWeekDate, 6), "M월 d일", { locale: ko })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addDays(currentDate, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            ref={weeklyScrollRef}
            className="overflow-auto max-h-[600px]"
            onScroll={(e) => e.stopPropagation()}
          >
            <div className="min-w-[800px]">
              {/* 헤더 */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-2 text-sm font-medium text-gray-500">
                  시간
                </div>
                {weekDays.map((day, index) => {
                  const record = getRecordForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={index}
                      className={`
                        p-2 text-center cursor-pointer hover:bg-gray-50 transition-colors
                        ${isSelected ? "bg-blue-50 border-blue-200" : ""}
                        ${isTodayDate ? "bg-yellow-50 border-yellow-200" : ""}
                      `}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="text-sm font-medium">
                        {format(day, "EEE", { locale: ko })}
                      </div>
                      <div className="text-lg font-bold">{day.getDate()}</div>
                      {record && (
                        <div className="text-xs text-blue-600 mt-1">
                          {formatHours(record.totalWorkHours)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 연속 시간 블록 */}
              <div className="grid grid-cols-8">
                {/* 시간 컬럼 */}
                <div className="border-r border-gray-200 p-2">
                  <div className="space-y-4">
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <div key={hour} className="text-xs text-gray-500 py-1 h-12 flex items-center">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>
                </div>
                {weekDays.map((day, dayIndex) => {
                  const record = getRecordForDate(day);
                  
                  if (!record || !record.statusChanges.length) {
                    return (
                      <div key={dayIndex} className="border-r border-gray-100 h-[1536px]">
                      </div>
                    );
                  }

                  // 상태 블록들 생성
                  const statusBlocks = [];
                  for (let i = 0; i < record.statusChanges.length; i++) {
                    const currentChange = record.statusChanges[i];
                    const nextChange = record.statusChanges[i + 1];
                    
                    // 시작 시간과 종료 시간 계산
                    const startTime = currentChange.time;
                    const endTime = nextChange ? nextChange.time : "24:00";
                    
                    // 시간을 분으로 변환
                    const startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
                    const endMinutes = nextChange 
                      ? parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1])
                      : 24 * 60;
                    
                    // 블록 높이 계산 (시간당 약 64px - h-12 * 4 space)
                    const duration = endMinutes - startMinutes;
                    const height = Math.max((duration / 60) * 64, 32); // 최소 32px, 시간당 64px
                    const top = (startMinutes / 60) * 64; // 0시부터 시작, 시간당 64px
                    
                    statusBlocks.push({
                      status: currentChange.status,
                      startTime,
                      endTime,
                      height,
                      top,
                      duration
                    });
                  }

                  // 상태에 따른 색상 설정
                  const getBlockColor = (status: WorkStatus) => {
                    switch (status) {
                      case "여의도_출근":
                      case "샛강_출근":
                        return "bg-blue-200 border-blue-300";
                      case "재택_출근":
                        return "bg-green-200 border-green-300";
                      case "외근":
                      case "복귀":
                        return "bg-purple-200 border-purple-300";
                      case "휴식":
                      case "식사":
                        return "bg-yellow-200 border-yellow-300";
                      default:
                        return "bg-gray-200 border-gray-300";
                    }
                  };

                  return (
                    <div 
                      key={dayIndex} 
                      className="relative border-r border-gray-100 h-[1536px] cursor-pointer"
                      onClick={() => handleDateClick(day)}
                    >
                      {statusBlocks.map((block, blockIndex) => (
                        <div
                          key={blockIndex}
                          className={`
                            absolute left-1 right-1 border rounded-md shadow-sm p-2
                            ${getBlockColor(block.status)}
                            hover:opacity-80 transition-opacity
                          `}
                          style={{
                            top: `${Math.max(block.top, 0)}px`,
                            height: `${block.height}px`
                          }}
                        >
                          <div className="text-xs font-medium">
                            {block.startTime} {getStatusDisplayName(block.status)}
                          </div>
                          {block.duration > 60 && (
                            <div className="text-xs text-gray-600 mt-1">
                              {formatHours(block.duration / 60)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 커스텀 일정 선택 테이블
  const CustomScheduleTable = () => {
    const filteredRecords = useMemo(() => {
      if (!dateRange?.from || !dateRange?.to) return [];

      return employee.attendanceRecords
        .filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate >= dateRange.from! && recordDate <= dateRange.to!;
        })
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [dateRange, employee.attendanceRecords]);

    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">커스텀 일정 선택</CardTitle>
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>요일</TableHead>
                <TableHead>근무시간</TableHead>
                <TableHead>휴식시간</TableHead>
                <TableHead>첫 출근</TableHead>
                <TableHead>마지막 퇴근</TableHead>
                <TableHead>상태 변경</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => {
                const date = new Date(record.date);
                const firstStatus = record.statusChanges[0];
                const lastStatus =
                  record.statusChanges[record.statusChanges.length - 1];

                return (
                  <TableRow
                    key={record.date}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onDateClick(record.date)}
                  >
                    <TableCell className="font-medium text-blue-600 hover:text-blue-800">
                      {format(date, "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>{format(date, "EEE", { locale: ko })}</TableCell>
                    <TableCell className="font-medium">
                      {record.totalWorkHours.toFixed(1)}h
                    </TableCell>
                    <TableCell>{record.totalBreakHours.toFixed(1)}h</TableCell>
                    <TableCell>
                      {firstStatus ? firstStatus.time : "-"}
                    </TableCell>
                    <TableCell>
                      {lastStatus?.status === "퇴근" ? lastStatus.time : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {record.statusChanges.length}회
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              선택한 기간에 근무 기록이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {employee.name}님의 개인 페이지
          </h1>
          <p className="text-muted-foreground">
            {employee.team} • {employee.office} 오피스
          </p>
        </div>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly" className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>월간 캘린더</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>주간 캘린더</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>커스텀 일정 선택</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <MonthlyCalendar />
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <WeeklyCalendar />
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <CustomScheduleTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
