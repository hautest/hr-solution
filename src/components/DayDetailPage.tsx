import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Plus } from "lucide-react";
import { AttendanceRecord, WorkStatus, Employee } from "@/types/employee";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { formatHours } from "@/lib/utils";

interface DayDetailPageProps {
  employee: Employee;
  record: AttendanceRecord;
  date: string;
  onUpdateRecord: (record: AttendanceRecord) => void;
}

export function DayDetailPage({ employee, record, date, onUpdateRecord }: DayDetailPageProps) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<string[]>([record.memo || ""].filter(Boolean));

  const dateObj = new Date(date);

  // 시간대별 블록 생성
  const createTimelineBlocks = () => {
    if (!record.statusChanges.length) return [];

    const blocks = [];
    for (let i = 0; i < record.statusChanges.length; i++) {
      const current = record.statusChanges[i];
      const next = record.statusChanges[i + 1];
      
      const startTime = current.time;
      const endTime = next ? next.time : "24:00";
      
      // 시간을 분으로 변환
      const startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
      const endMinutes = next 
        ? parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1])
        : 24 * 60;
      
      const duration = endMinutes - startMinutes;
      const widthPercent = (duration / (24 * 60)) * 100;
      const leftPercent = (startMinutes / (24 * 60)) * 100;
      
      blocks.push({
        status: current.status,
        startTime,
        endTime,
        duration,
        widthPercent,
        leftPercent
      });
    }
    
    return blocks;
  };

  const timelineBlocks = createTimelineBlocks();

  const getStatusColor = (status: WorkStatus) => {
    switch (status) {
      case '여의도_출근':
      case '샛강_출근':
        return 'bg-blue-500';
      case '재택_출근':
        return 'bg-green-500';
      case '외근':
      case '복귀':
        return 'bg-purple-500';
      case '휴식':
      case '식사':
        return 'bg-yellow-500';
      case '퇴근':
        return 'bg-gray-400';
      case '연차':
      case '반차':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusDisplayName = (status: WorkStatus) => {
    return status.replace('_', ' ');
  };

  const addComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment.trim()]);
      setNewComment("");
      // 업데이트된 레코드를 부모에게 전달
      const updatedRecord = { ...record, memo: [...comments, newComment.trim()].join('\n') };
      onUpdateRecord(updatedRecord);
    }
  };


  const uniqueStatuses = [...new Set(record.statusChanges.map(change => change.status))];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {format(dateObj, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
            </h1>
            <p className="text-muted-foreground">
              {employee.name} • {employee.team}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">총 근무시간</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatHours(record.totalWorkHours)}
            </div>
          </div>
        </div>

        {/* 타임라인 그래프 */}
        <Card>
          <CardHeader>
            <CardTitle>시간대별 근무 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 시간 눈금 */}
            <div className="relative">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i} className="text-center" style={{ width: '4%' }}>
                    {i.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
              
              {/* 타임라인 바 */}
              <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
                {timelineBlocks.map((block, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute h-full ${getStatusColor(block.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer rounded`}
                        style={{
                          left: `${block.leftPercent}%`,
                          width: `${block.widthPercent}%`,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{getStatusDisplayName(block.status)}</p>
                      <p className="text-sm">
                        {block.startTime} ~ {block.endTime}
                      </p>
                      <p className="text-sm">
                        {formatHours(block.duration / 60)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap gap-4">
              {uniqueStatuses.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getStatusColor(status)}`} />
                  <span className="text-sm">{getStatusDisplayName(status)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 상세 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>근무 상세 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {record.statusChanges.map((change, index) => {
                const nextChange = record.statusChanges[index + 1];
                const endTime = nextChange ? nextChange.time : "24:00";
                const startMinutes = parseInt(change.time.split(":")[0]) * 60 + parseInt(change.time.split(":")[1]);
                const endMinutes = nextChange 
                  ? parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1])
                  : 24 * 60;
                const duration = endMinutes - startMinutes;

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(change.status)}`} />
                      <span className="font-medium">{getStatusDisplayName(change.status)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {change.time} ~ {endTime} ({formatHours(duration / 60)})
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              댓글
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 기존 댓글들 */}
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{employee.name}</span>
                    <span className="text-xs text-gray-500">{format(new Date(), 'HH:mm')}</span>
                  </div>
                  <p className="text-sm">{comment}</p>
                </div>
              ))}
            </div>

            {/* 새 댓글 입력 */}
            <div className="space-y-3">
              <Textarea
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button onClick={addComment} disabled={!newComment.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  댓글 추가
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}