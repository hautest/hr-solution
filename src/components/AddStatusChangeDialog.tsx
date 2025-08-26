import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StatusChange } from '@/types/employee'

interface AddStatusChangeDialogProps {
  onAdd: (newStatusChange: Omit<StatusChange, 'id'>) => void
}

export function AddStatusChangeDialog({ onAdd }: AddStatusChangeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    time: '09:00',
    status: 'work_office' as StatusChange['status'],
    slackKeyword: '',
    slackMessageLink: ''
  })

  const handleSubmit = () => {
    onAdd({
      time: formData.time,
      status: formData.status,
      slackKeyword: formData.slackKeyword || undefined,
      slackMessageLink: formData.slackMessageLink || undefined,
      isManualEntry: true
    })
    
    // 폼 초기화 및 모달 닫기
    setFormData({
      time: '09:00',
      status: 'work_office',
      slackKeyword: '',
      slackMessageLink: ''
    })
    setIsOpen(false)
  }

  const handleCancel = () => {
    // 폼 초기화 및 모달 닫기
    setFormData({
      time: '09:00',
      status: 'work_office',
      slackKeyword: '',
      slackMessageLink: ''
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 상태 변경 추가</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">시간</label>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">상태</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as StatusChange['status'] }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work_office">사무실 근무</SelectItem>
                <SelectItem value="work_remote">재택 근무</SelectItem>
                <SelectItem value="break">휴식</SelectItem>
                <SelectItem value="off">퇴근</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">슬랙 키워드 (선택사항)</label>
            <Input
              placeholder="예: 출근, 재택출근, 점심, 휴식, 퇴근"
              value={formData.slackKeyword}
              onChange={(e) => setFormData(prev => ({ ...prev, slackKeyword: e.target.value }))}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">슬랙 메시지 링크 (선택사항)</label>
            <Input
              placeholder="https://company.slack.com/archives/..."
              value={formData.slackMessageLink}
              onChange={(e) => setFormData(prev => ({ ...prev, slackMessageLink: e.target.value }))}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleSubmit}>
              추가하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}