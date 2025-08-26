export interface Employee {
  id: string;
  name: string;
  nickname: string;
  team: string;
  attendanceRecords: AttendanceRecord[];
}

export interface AttendanceRecord {
  date: string;
  totalWorkHours: number;
  totalBreakHours: number;
  statusChanges: StatusChange[];
  editHistory: EditHistory[];
}

export interface StatusChange {
  id: string;
  time: string;
  status: "work_office" | "work_remote" | "break" | "off";
  slackKeyword?: string;
  slackMessageLink?: string;
  isManualEntry?: boolean;
}

export interface EditHistory {
  id: string;
  timestamp: string;
  editedBy: string;
  action: "add" | "edit" | "delete";
  description: string;
  oldValue?: any;
  newValue?: any;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}
