import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import type { AttendanceRecord, DateRange } from '@/types/employee'

interface RemoteWorkPatternProps {
  records: AttendanceRecord[]
  dateRange: DateRange
}

export function RemoteWorkPattern({ records }: RemoteWorkPatternProps) {
  const workPatternData = useMemo(() => {
    if (records.length === 0) return []

    let officeCount = 0
    let remoteCount = 0

    records.forEach(record => {
      const hasOffice = record.statusChanges.some(change => change.status === 'work_office')
      const hasRemote = record.statusChanges.some(change => change.status === 'work_remote')
      
      if (hasOffice) officeCount++
      if (hasRemote) remoteCount++
    })

    const data = []
    if (officeCount > 0) {
      data.push({ name: '사무실 근무', value: officeCount, color: '#10b981' })
    }
    if (remoteCount > 0) {
      data.push({ name: '원격 근무', value: remoteCount, color: '#3b82f6' })
    }

    return data
  }, [records])

  if (workPatternData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        근무 기록이 없습니다.
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={workPatternData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {workPatternData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}