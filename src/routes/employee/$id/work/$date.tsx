import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Clock, Edit2, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EditAttendanceDialog } from "@/components/EditAttendanceDialog";
import { TimelineTooltip } from "@/components/TimelineTooltip";
import { mockEmployees, getDailyScrum, getDailyScrumSlackLink } from "@/lib/mockData";
import { formatHours } from "@/lib/utils";

const statusLabels = {
  work_office: "사무실 근무",
  work_remote: "원격 근무",
  break: "휴식",
  off: "퇴근",
};

const statusColors = {
  work_office: "bg-green-100 text-green-700",
  work_remote: "bg-blue-100 text-blue-700",
  break: "bg-yellow-100 text-yellow-700",
  off: "bg-gray-100 text-gray-700",
};

export const Route = createFileRoute("/employee/$id/work/$date")({
  component: WorkDetail,
});

function WorkDetail() {
  const { id, date } = Route.useParams();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });

  const employee = mockEmployees.find((emp) => emp.id === id);
  const workRecord = employee?.attendanceRecords.find(
    (record) => record.date === date
  );

  const timelineData = useMemo(() => {
    if (!workRecord) return [];

    const sortedChanges = [...workRecord.statusChanges].sort((a, b) => a.time.localeCompare(b.time));
    const segments = [];

    // 상태 변경 기록을 기반으로 연속된 구간 생성 (퇴근 제외)
    for (let i = 0; i < sortedChanges.length; i++) {
      const currentChange = sortedChanges[i];
      const nextChange = sortedChanges[i + 1];
      
      // 퇴근 상태는 바에서 제외
      if (currentChange.status === 'off') continue;
      
      let startTime, endTime;
      
      if (currentChange.time.includes('T')) {
        startTime = parseISO(currentChange.time);
      } else {
        startTime = new Date(`${date}T${currentChange.time}`);
      }
      
      // 다음 상태 변경까지의 구간 계산
      if (nextChange) {
        if (nextChange.time.includes('T')) {
          endTime = parseISO(nextChange.time);
        } else {
          endTime = new Date(`${date}T${nextChange.time}`);
        }
      } else {
        // 마지막 상태가 퇴근이 아닌 경우에만 하루 끝까지
        endTime = new Date(`${date}T23:59:59`);
      }

      const startHour = startTime.getHours();
      const startMin = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMin = endTime.getMinutes();
      
      segments.push({
        status: currentChange.status,
        startTime: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
        endTime: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
        duration: (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60), // 시간 단위
        label: statusLabels[currentChange.status],
        color: statusColors[currentChange.status].includes('green') ? '#10b981' :
               statusColors[currentChange.status].includes('blue') ? '#3b82f6' :
               statusColors[currentChange.status].includes('yellow') ? '#f59e0b' : '#6b7280',
      });
    }

    return segments;
  }, [workRecord, date]);


  if (!employee || !workRecord) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            근무 기록을 찾을 수 없습니다
          </h1>
          <Link to="/employee/$id" params={{ id: id || "" }}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              구성원 상세로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/employee/$id" params={{ id }}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {format(parseISO(date), "yyyy년 M월 d일", { locale: ko })} 근무 상세
          </h1>
          <p className="text-muted-foreground">
            {employee.nickname}({employee.name}) • {employee.team}
          </p>
        </div>
        <Button
          onClick={() => setIsEditDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          기록 수정
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              시간대별 근무 현황
            </h2>
            <div className="space-y-4">
              {/* 시간 축 레이블 */}
              <div className="flex text-xs text-muted-foreground">
                <div className="flex-1 text-left">00:00</div>
                <div className="flex-1 text-center">06:00</div>
                <div className="flex-1 text-center">12:00</div>
                <div className="flex-1 text-center">18:00</div>
                <div className="flex-1 text-right">24:00</div>
              </div>
              
              {/* 1자 타임라인 바 */}
              <div className="relative h-12 bg-gray-100 rounded overflow-hidden">
                {timelineData.map((segment, index) => {
                  // 시작 시간을 24시간 기준 비율로 계산
                  const [startHour, startMin] = segment.startTime.split(':').map(Number);
                  const [endHour, endMin] = segment.endTime.split(':').map(Number);
                  
                  const startPercent = ((startHour + startMin / 60) / 24) * 100;
                  const endPercent = ((endHour + endMin / 60) / 24) * 100;
                  const width = endPercent - startPercent;
                  
                  return (
                    <div
                      key={index}
                      className="absolute h-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        left: `${startPercent}%`,
                        width: `${width}%`,
                        backgroundColor: segment.color,
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          show: true,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                          data: {
                            label: segment.label,
                            startTime: segment.startTime,
                            endTime: segment.endTime,
                            duration: segment.duration,
                          } as any
                        });
                      }}
                      onMouseLeave={() => {
                        setTooltip({ show: false, x: 0, y: 0, data: null });
                      }}
                    >
                      {width > 8 && (
                        <span className="text-xs font-medium text-white text-center px-1">
                          {segment.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* 범례 */}
              <div className="flex flex-wrap gap-4 text-xs">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${statusColors[status as keyof typeof statusColors]}`}></div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">상태 변경 기록</h2>
            <div className="space-y-3">
              {workRecord.statusChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono font-medium">
                      {change.time.includes('T') ? format(parseISO(change.time), "HH:mm") : change.time}
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-sm ${statusColors[change.status]}`}
                    >
                      {statusLabels[change.status]}
                    </div>
                    {change.slackKeyword && (
                      <div className="text-sm text-muted-foreground">
                        "{change.slackKeyword}"
                      </div>
                    )}
                    {change.isManualEntry && (
                      <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        수동 추가
                      </div>
                    )}
                  </div>
                  {change.slackMessageLink && (
                    <a
                      href={change.slackMessageLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">근무 요약</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 근무 시간</span>
                <span className="font-mono font-semibold">
                  {formatHours(workRecord.totalWorkHours)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 휴식 시간</span>
                <span className="font-mono">
                  {formatHours(workRecord.totalBreakHours)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">근무 유형</span>
                <span className="font-medium">
                  {workRecord.statusChanges.find(
                    (c) => c.status === "work_office"
                  )
                    ? "사무실"
                    : "원격"}
                </span>
              </div>
            </div>
          </div>

          {workRecord.editHistory.length > 0 && (
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">수정 이력</h2>
              <div className="space-y-3">
                {workRecord.editHistory.map((edit) => (
                  <div
                    key={edit.id}
                    className="text-sm space-y-1 p-3 bg-muted/30 rounded"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{edit.editedBy}</span>
                      <span className="text-muted-foreground">
                        {format(parseISO(edit.timestamp), "HH:mm", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {edit.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">데일리 스크럼</h2>
              <a
                href={getDailyScrumSlackLink(id, date)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                title="슬랙 메시지 보기"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="text-sm whitespace-pre-line">
              {getDailyScrum(id, date)}
            </div>
          </div>
        </div>
      </div>

      <TimelineTooltip {...tooltip} />

      <EditAttendanceDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        record={workRecord}
        onSave={(updatedRecord) => {
          console.log("Updated record:", updatedRecord);
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
}