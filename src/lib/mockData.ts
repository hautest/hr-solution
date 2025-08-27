import { Employee, AttendanceRecord, StatusChange, EditHistory, CompanyDashboard, CompanyEvent } from '../types/employee';
import { format, subDays } from 'date-fns';


const generateStatusChanges = (date: Date, office: '여의도' | '샛강'): StatusChange[] => {
  const changes: StatusChange[] = [];
  
  // 출근 (9:00-9:30 사이)
  const startTime = new Date(date);
  const startHour = 9 + Math.floor(Math.random() * 0.5);
  const startMinute = Math.floor(Math.random() * 30);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const workType = Math.random() > 0.7 ? '재택_출근' : (office === '여의도' ? '여의도_출근' : '샛강_출근');
  
  changes.push({
    id: `${date.toISOString()}-start`,
    time: format(startTime, 'HH:mm'),
    status: workType,
    slackKeyword: workType === '재택_출근' ? '재택' : '출근',
    slackMessageLink: `https://raftel.slack.com/archives/C123456/${Date.now()}`,
    isManualEntry: false,
  });

  // 점심시간 (12:00-13:00 사이)
  const lunchStart = new Date(date);
  lunchStart.setHours(12, Math.floor(Math.random() * 60), 0, 0);
  changes.push({
    id: `${date.toISOString()}-lunch-start`,
    time: format(lunchStart, 'HH:mm'),
    status: '식사',
    slackKeyword: '식사',
    slackMessageLink: `https://raftel.slack.com/archives/C123456/${Date.now() + 1}`,
    isManualEntry: false,
  });

  // 복귀 (13:00-14:00 사이)
  const lunchEnd = new Date(lunchStart);
  lunchEnd.setHours(lunchEnd.getHours() + 1);
  changes.push({
    id: `${date.toISOString()}-lunch-end`,
    time: format(lunchEnd, 'HH:mm'),
    status: '복귀',
    slackKeyword: '복귀',
    slackMessageLink: `https://raftel.slack.com/archives/C123456/${Date.now() + 2}`,
    isManualEntry: false,
  });

  // 퇴근 (18:00-19:30 사이)
  const endTime = new Date(date);
  endTime.setHours(18 + Math.floor(Math.random() * 1.5), Math.floor(Math.random() * 60), 0, 0);
  changes.push({
    id: `${date.toISOString()}-end`,
    time: format(endTime, 'HH:mm'),
    status: '퇴근',
    slackKeyword: '퇴근',
    slackMessageLink: `https://raftel.slack.com/archives/C123456/${Date.now() + 3}`,
    isManualEntry: false,
  });

  return changes;
};

const generateEditHistory = (): EditHistory[] => {
  const histories: EditHistory[] = [];
  
  if (Math.random() > 0.8) {
    histories.push({
      id: `edit-${Date.now()}`,
      timestamp: subDays(new Date(), Math.floor(Math.random() * 7)).toISOString(),
      editedBy: '인사팀 관리자',
      action: 'correct',
      description: '점심시간 정정',
      oldValue: '12:00',
      newValue: '12:30',
    });
  }
  
  return histories;
};

const generateAttendanceRecords = (office: '여의도' | '샛강'): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 주말과 일부 공휴일 제외
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }
    
    const statusChanges = generateStatusChanges(date, office);
    const totalWorkHours = 7.5 + Math.random() * 1.5;
    
    records.push({
      date: dateStr,
      totalWorkHours,
      totalBreakHours: 1,
      statusChanges,
      editHistory: generateEditHistory(),
      memo: Math.random() > 0.8 ? '클라이언트 미팅으로 인한 외근' : undefined,
      memoEditedBy: Math.random() > 0.8 ? '본인' : undefined,
      memoEditedAt: Math.random() > 0.8 ? new Date().toISOString() : undefined,
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: '김개발',
    nickname: '개발',
    team: '개발팀',
    office: '여의도',
    role: '팀원',
    slackUserId: 'U1234567890',
    googleCalendarId: 'dev@raftel.com',
    attendanceRecords: generateAttendanceRecords('여의도'),
  },
  {
    id: '2',
    name: '이디자인',
    nickname: '디자인',
    team: '디자인팀',
    office: '샛강',
    role: '팀장',
    slackUserId: 'U1234567891',
    googleCalendarId: 'design@raftel.com',
    attendanceRecords: generateAttendanceRecords('샛강'),
  },
  {
    id: '3',
    name: '박프론트',
    nickname: '프론트',
    team: '개발팀',
    office: '여의도',
    role: '팀원',
    slackUserId: 'U1234567892',
    googleCalendarId: 'frontend@raftel.com',
    attendanceRecords: generateAttendanceRecords('여의도'),
  },
  {
    id: '4',
    name: '최마케팅',
    nickname: '마케팅',
    team: '마케팅팀',
    office: '샛강',
    role: '팀원',
    slackUserId: 'U1234567893',
    googleCalendarId: 'marketing@raftel.com',
    attendanceRecords: generateAttendanceRecords('샛강'),
  },
  {
    id: '5',
    name: '정백엔드',
    nickname: '백엔드',
    team: '개발팀',
    office: '여의도',
    role: '팀원',
    slackUserId: 'U1234567894',
    googleCalendarId: 'backend@raftel.com',
    attendanceRecords: generateAttendanceRecords('여의도'),
  },
  {
    id: '6',
    name: '한인사',
    nickname: '인사',
    team: '인사팀',
    office: '여의도',
    role: '인사팀',
    slackUserId: 'U1234567895',
    googleCalendarId: 'hr@raftel.com',
    attendanceRecords: generateAttendanceRecords('여의도'),
  },
  {
    id: '7',
    name: '윤기획',
    nickname: '기획',
    team: '기획팀',
    office: '샛강',
    role: '팀장',
    slackUserId: 'U1234567896',
    googleCalendarId: 'planning@raftel.com',
    attendanceRecords: generateAttendanceRecords('샛강'),
  },
  {
    id: '8',
    name: '장콘텐츠',
    nickname: '콘텐츠',
    team: '콘텐츠팀',
    office: '여의도',
    role: '팀원',
    slackUserId: 'U1234567897',
    googleCalendarId: 'content@raftel.com',
    attendanceRecords: generateAttendanceRecords('여의도'),
  },
];

// 회사 전체 현황 데이터
export const mockCompanyData: CompanyDashboard = {
  totalEmployees: mockEmployees.length,
  currentAttendance: {
    office: 5,
    remote: 2,
    break: 1,
    off: 0,
  },
  officeStats: {
    여의도: {
      total: 5,
      present: 3,
      remote: 1,
    },
    샛강: {
      total: 3,
      present: 2,
      remote: 1,
    },
  },
  teamStats: [
    {
      teamName: '개발팀',
      totalMembers: 3,
      currentStatus: { work: 2, break: 1, off: 0 }
    },
    {
      teamName: '디자인팀',
      totalMembers: 1,
      currentStatus: { work: 1, break: 0, off: 0 }
    },
    {
      teamName: '마케팅팀',
      totalMembers: 1,
      currentStatus: { work: 1, break: 0, off: 0 }
    },
    {
      teamName: '기획팀',
      totalMembers: 1,
      currentStatus: { work: 1, break: 0, off: 0 }
    },
    {
      teamName: '콘텐츠팀',
      totalMembers: 1,
      currentStatus: { work: 1, break: 0, off: 0 }
    },
    {
      teamName: '인사팀',
      totalMembers: 1,
      currentStatus: { work: 1, break: 0, off: 0 }
    },
  ]
};

// 회사 주요 일정
export const mockEvents: CompanyEvent[] = [
  {
    id: '1',
    title: '신정',
    date: '2025-01-01',
    type: '공휴일',
    description: '새해 첫날'
  },
  {
    id: '2',
    title: '라프텔 창립기념일',
    date: '2025-01-15',
    type: '창립기념일',
    description: '회사 창립 기념일'
  },
  {
    id: '3',
    title: '전사 워크샵',
    date: '2025-02-14',
    type: '워크샵',
    description: '2025년 1분기 전사 워크샵'
  },
  {
    id: '4',
    title: '설날',
    date: '2025-01-29',
    type: '공휴일',
    description: '설날 연휴'
  },
  {
    id: '5',
    title: '3.1절',
    date: '2025-03-01',
    type: '공휴일',
    description: '삼일절'
  },
];

export const teams = ['전체', '개발팀', '디자인팀', '마케팅팀', '기획팀', '콘텐츠팀', '인사팀'];

// 슬랙 연동 관련 유틸리티 함수들
export const getSlackChannelLink = () => {
  return 'https://raftel.slack.com/channels/work-status';
};

export const getSlackBotCommands = () => {
  return [
    { command: '출근', description: '여의도 사무실 출근' },
    { command: '샛강출근', description: '샛강 사무실 출근' },
    { command: '재택', description: '재택근무 시작' },
    { command: '외근', description: '외근 시작' },
    { command: '복귀', description: '외근에서 복귀' },
    { command: '식사', description: '식사 시작' },
    { command: '휴식', description: '휴식 시작' },
    { command: '퇴근', description: '퇴근' },
    { command: '연차', description: '연차 사용' },
    { command: '반차', description: '반차 사용' },
  ];
};