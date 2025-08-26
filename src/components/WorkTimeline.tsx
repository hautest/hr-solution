import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ExternalLink, Edit } from 'lucide-react'
import { EditAttendanceDialog } from './EditAttendanceDialog'
import type { AttendanceRecord } from '@/types/employee'

interface WorkTimelineProps {
  record: AttendanceRecord
  onRecordUpdate?: (updatedRecord: AttendanceRecord) => void
}

const getTimeInMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const formatTimeFromMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function WorkTimeline({ record, onRecordUpdate }: WorkTimelineProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const startTime = 0 * 60 // 00:00 in minutes
  const endTime = 24 * 60 // 24:00 in minutes
  const timelineWidth = endTime - startTime // 24 hours
  
  // Generate timeline segments based on status changes
  const segments = []
  const sortedChanges = [...record.statusChanges].sort((a, b) => 
    getTimeInMinutes(a.time) - getTimeInMinutes(b.time)
  )
  
  for (let i = 0; i < sortedChanges.length; i++) {
    const current = sortedChanges[i]
    const next = sortedChanges[i + 1]
    
    const startMinutes = getTimeInMinutes(current.time)
    const endMinutes = next ? getTimeInMinutes(next.time) : endTime
    
    if (startMinutes >= startTime && startMinutes < endTime) {
      const segmentStart = Math.max(startMinutes, startTime)
      const segmentEnd = Math.min(endMinutes, endTime)
      
      if (segmentEnd > segmentStart) {
        const leftPercent = ((segmentStart - startTime) / timelineWidth) * 100
        const widthPercent = ((segmentEnd - segmentStart) / timelineWidth) * 100
        
        segments.push({
          status: current.status,
          left: leftPercent,
          width: widthPercent,
          startTime: formatTimeFromMinutes(segmentStart),
          endTime: formatTimeFromMinutes(segmentEnd),
          keyword: current.slackKeyword
        })
      }
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'work_office': return 'bg-blue-500'
      case 'work_remote': return 'bg-green-500'
      case 'break': return 'bg-yellow-400'
      case 'off': return 'bg-gray-300'
      default: return 'bg-gray-300'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'work_office': return '사무실'
      case 'work_remote': return '재택'
      case 'break': return '휴식'
      case 'off': return '퇴근'
      default: return '미상'
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">
          {format(new Date(record.date + 'T00:00:00'), 'yyyy년 MM월 dd일 (E)', { locale: ko })}
        </h4>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            근무: {record.totalWorkHours}h | 휴식: {record.totalBreakHours}h
          </div>
          {onRecordUpdate && (
            <EditAttendanceDialog 
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              record={record} 
              onSave={onRecordUpdate!} 
            />
          )}
        </div>
      </div>
      
      {/* Timeline container */}
      <div className="relative">
        {/* Time labels */}
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i}>{formatTimeFromMinutes(i * 4 * 60)}</span>
          ))}
        </div>
        
        {/* Timeline track */}
        <div className="relative h-8 bg-gray-100 rounded-md overflow-hidden">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`absolute h-full ${getStatusColor(segment.status)} opacity-80 hover:opacity-100 transition-opacity group`}
              style={{
                left: `${segment.left}%`,
                width: `${segment.width}%`
              }}
              title={`${getStatusText(segment.status)}: ${segment.startTime} - ${segment.endTime}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {getStatusText(segment.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Status changes list */}
      <div className="space-y-2">
        <h5 className="text-sm font-medium">상태 변경 기록</h5>
        <div className="space-y-1">
          {record.statusChanges.map((change, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <span className="font-mono">{change.time}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                change.status === 'work_office' ? 'bg-blue-100 text-blue-800' :
                change.status === 'work_remote' ? 'bg-green-100 text-green-800' :
                change.status === 'break' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getStatusText(change.status)}
              </span>
              
              {change.isManualEntry ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                  <Edit className="h-3 w-3" />
                  직접 작성
                </span>
              ) : (
                <>
                  {change.slackKeyword && (
                    <span className="text-muted-foreground">
                      슬랙: "{change.slackKeyword}"
                    </span>
                  )}
                  {change.slackMessageLink && (
                    <a
                      href={change.slackMessageLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      title="슬랙 메시지 보기"
                    >
                      <ExternalLink className="h-3 w-3" />
                      메시지
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}