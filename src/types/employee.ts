export interface Employee {
  id: string;
  name: string;
  nickname: string;
  team: string;
  office: "여의도" | "샛강";
  role: "팀원" | "팀장" | "인사팀";
  attendanceRecords: AttendanceRecord[];
  googleCalendarId?: string;
  slackUserId: string;
}

export interface AttendanceRecord {
  date: string;
  totalWorkHours: number;
  totalBreakHours: number;
  statusChanges: StatusChange[];
  editHistory: EditHistory[];
  memo?: string;
  memoEditedBy?: string;
  memoEditedAt?: string;
}

export type WorkStatus = 
  | "여의도_출근"    // 여의도 사무실 출근
  | "샛강_출근"      // 샛강 사무실 출근  
  | "재택_출근"      // 재택 출근
  | "외근"          // 외근
  | "복귀"          // 복귀
  | "휴식"          // 휴식
  | "식사"          // 식사
  | "퇴근"          // 퇴근
  | "연차"          // 연차
  | "반차";         // 반차

export interface StatusChange {
  id: string;
  time: string;
  status: WorkStatus;
  slackKeyword?: string;
  slackMessageLink?: string;
  isManualEntry?: boolean;
  createdBy?: string;
  isCorrection?: boolean; // 정정 기록인지 여부
  originalRecordId?: string; // 정정되는 원본 기록 ID
}

export interface EditHistory {
  id: string;
  timestamp: string;
  editedBy: string;
  action: "add" | "correct" | "note"; // delete 제거, correct 추가
  description: string;
  oldValue?: any;
  newValue?: any;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface CompanyDashboard {
  totalEmployees: number;
  currentAttendance: {
    office: number;
    remote: number;
    break: number;
    off: number;
  };
  officeStats: {
    여의도: {
      total: number;
      present: number;
      remote: number;
    };
    샛강: {
      total: number;
      present: number;
      remote: number;
    };
  };
  teamStats: TeamAttendanceStats[];
}

export interface TeamAttendanceStats {
  teamName: string;
  totalMembers: number;
  currentStatus: {
    work: number;
    break: number;
    off: number;
  };
}

export interface CompanyEvent {
  id: string;
  title: string;
  date: string;
  type: "공휴일" | "워크샵" | "창립기념일" | "기타";
  description?: string;
}
