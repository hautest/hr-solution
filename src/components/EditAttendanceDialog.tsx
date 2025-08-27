import { useState } from "react";
import { Trash2, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddStatusChangeDialog } from "./AddStatusChangeDialog";
import type {
  AttendanceRecord,
  StatusChange,
  EditHistory,
} from "@/types/employee";

interface EditAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord;
  onSave: (updatedRecord: AttendanceRecord) => void;
}

export function EditAttendanceDialog({
  isOpen,
  onClose,
  record,
  onSave,
}: EditAttendanceDialogProps) {
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord>({
    ...record,
    statusChanges: [...record.statusChanges],
    editHistory: [...record.editHistory],
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getStatusText = (status: string) => {
    switch (status) {
      case "work_office":
        return "사무실";
      case "work_remote":
        return "재택";
      case "break":
        return "휴식";
      case "off":
        return "퇴근";
      default:
        return "미상";
    }
  };

  const addEditHistory = (
    action: "add" | "edit" | "delete",
    description: string,
    oldValue?: any,
    newValue?: any
  ) => {
    const newHistory: EditHistory = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      editedBy: "관리자", // 실제 구현시에는 현재 사용자 정보
      action,
      description,
      oldValue,
      newValue,
    };

    setEditingRecord((prev) => ({
      ...prev,
      editHistory: [...prev.editHistory, newHistory],
    }));
  };

  const addStatusChange = (newStatusChangeData: Omit<StatusChange, "id">) => {
    const newChange: StatusChange = {
      id: generateId(),
      ...newStatusChangeData,
    };

    setEditingRecord((prev) => ({
      ...prev,
      statusChanges: [...prev.statusChanges, newChange].sort((a, b) =>
        a.time.localeCompare(b.time)
      ),
    }));

    addEditHistory(
      "add",
      `새 상태 변경 추가: ${newChange.time} ${getStatusText(newChange.status)}`
    );
  };

  const updateStatusChange = (
    id: string,
    field: keyof StatusChange,
    value: any
  ) => {
    setEditingRecord((prev) => {
      const newChanges = prev.statusChanges.map((change) =>
        change.id === id ? { ...change, [field]: value } : change
      );

      return {
        ...prev,
        statusChanges: newChanges.sort((a, b) => a.time.localeCompare(b.time)),
      };
    });
  };

  const deleteStatusChange = (id: string) => {
    const changeToDelete = editingRecord.statusChanges.find((c) => c.id === id);
    if (changeToDelete) {
      setEditingRecord((prev) => ({
        ...prev,
        statusChanges: prev.statusChanges.filter((c) => c.id !== id),
      }));

      addEditHistory(
        "delete",
        `상태 변경 삭제: ${changeToDelete.time} ${getStatusText(changeToDelete.status)}`
      );
    }
  };

  const saveChanges = () => {
    // 총 근무시간과 휴식시간 재계산 (간단한 예시)
    const totalHours =
      editingRecord.statusChanges.filter(
        (c) => c.status === "work_office" || c.status === "work_remote"
      ).length * 1; // 실제로는 더 복잡한 계산 필요

    const updatedRecord = {
      ...editingRecord,
      totalWorkHours: totalHours,
      totalBreakHours:
        editingRecord.statusChanges.filter((c) => c.status === "break").length *
        0.5,
    };

    onSave(updatedRecord);
    onClose();
  };

  const resetChanges = () => {
    setEditingRecord({
      ...record,
      statusChanges: [...record.statusChanges],
      editHistory: [...record.editHistory],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit3 className="h-4 w-4 mr-1" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>근무 기록 수정 - {record.date}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 상태 변경 기록 편집 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">상태 변경 기록</h3>
              <AddStatusChangeDialog onAdd={addStatusChange} />
            </div>

            <div className="space-y-3">
              {editingRecord.statusChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Input
                    type="time"
                    value={change.time}
                    onChange={(e) =>
                      updateStatusChange(change.id, "time", e.target.value)
                    }
                    className="w-32"
                  />

                  <Select
                    value={change.status}
                    onValueChange={(value) =>
                      updateStatusChange(change.id, "status", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work_office">사무실</SelectItem>
                      <SelectItem value="work_remote">재택</SelectItem>
                      <SelectItem value="break">휴식</SelectItem>
                      <SelectItem value="off">퇴근</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="슬랙 키워드"
                    value={change.slackKeyword || ""}
                    onChange={(e) =>
                      updateStatusChange(
                        change.id,
                        "slackKeyword",
                        e.target.value
                      )
                    }
                    className="flex-1"
                  />

                  <Input
                    placeholder="슬랙 메시지 링크"
                    value={change.slackMessageLink || ""}
                    onChange={(e) =>
                      updateStatusChange(
                        change.id,
                        "slackMessageLink",
                        e.target.value
                      )
                    }
                    className="flex-1"
                  />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteStatusChange(change.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 변경 이력 */}
          <div>
            <h3 className="text-lg font-medium mb-4">변경 이력</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editingRecord.editHistory.map((history) => (
                <div
                  key={history.id}
                  className="text-sm p-2 bg-gray-50 rounded"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{history.description}</span>
                    <span className="text-muted-foreground">
                      {new Date(history.timestamp).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    수정자: {history.editedBy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 저장/취소 버튼 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetChanges}>
              <X className="h-4 w-4 mr-1" />
              취소
            </Button>
            <Button onClick={saveChanges}>
              <Save className="h-4 w-4 mr-1" />
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
