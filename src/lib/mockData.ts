import { Employee, AttendanceRecord, StatusChange, EditHistory } from '../types/employee';
import { format, subDays, addHours } from 'date-fns';

const generateStatusChanges = (date: Date, workType: 'office' | 'remote'): StatusChange[] => {
  const changes: StatusChange[] = [];
  
  // 출근
  const startTime = new Date(date);
  startTime.setHours(9, Math.floor(Math.random() * 30), 0, 0); // 9:00-9:30 사이
  changes.push({
    id: `${date.toISOString()}-start`,
    time: startTime.toISOString(),
    status: workType === 'office' ? 'work_office' : 'work_remote',
    slackKeyword: workType === 'office' ? '출근' : '재택 시작',
    slackMessageLink: `https://slack.com/archives/C123456/${Date.now()}`,
    isManualEntry: false,
  });

  // 점심시간
  const lunchStart = new Date(date);
  lunchStart.setHours(12, Math.floor(Math.random() * 30), 0, 0); // 12:00-12:30 사이
  changes.push({
    id: `${date.toISOString()}-lunch-start`,
    time: lunchStart.toISOString(),
    status: 'break',
    slackKeyword: '점심',
    slackMessageLink: `https://slack.com/archives/C123456/${Date.now() + 1}`,
    isManualEntry: false,
  });

  // 점심시간 종료
  const lunchEnd = addHours(lunchStart, 1);
  changes.push({
    id: `${date.toISOString()}-lunch-end`,
    time: lunchEnd.toISOString(),
    status: workType === 'office' ? 'work_office' : 'work_remote',
    slackKeyword: '업무 복귀',
    slackMessageLink: `https://slack.com/archives/C123456/${Date.now() + 2}`,
    isManualEntry: false,
  });

  // 퇴근
  const endTime = new Date(date);
  endTime.setHours(18, Math.floor(Math.random() * 60), 0, 0); // 18:00-19:00 사이
  changes.push({
    id: `${date.toISOString()}-end`,
    time: endTime.toISOString(),
    status: 'off',
    slackKeyword: '퇴근',
    slackMessageLink: `https://slack.com/archives/C123456/${Date.now() + 3}`,
    isManualEntry: false,
  });

  return changes;
};

const generateEditHistory = (): EditHistory[] => {
  const histories: EditHistory[] = [];
  
  if (Math.random() > 0.7) { // 30% 확률로 수정 이력 생성
    histories.push({
      id: `edit-${Date.now()}`,
      timestamp: subDays(new Date(), Math.floor(Math.random() * 7)).toISOString(),
      editedBy: '관리자',
      action: 'edit',
      description: '점심시간 시작 시간 수정',
      oldValue: '12:00',
      newValue: '12:30',
    });
  }
  
  return histories;
};

const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  
  // 최근 30일간의 근무 기록 생성
  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 주말은 건너뛰기
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }
    
    const workType = Math.random() > 0.6 ? 'remote' : 'office'; // 40% 원격, 60% 사무실
    const statusChanges = generateStatusChanges(date, workType);
    
    // 총 근무시간 계산 (8-9시간 사이)
    const totalWorkHours = 7.5 + Math.random() * 1.5;
    
    records.push({
      date: dateStr,
      totalWorkHours,
      totalBreakHours: 1, // 점심시간 1시간
      statusChanges,
      editHistory: generateEditHistory(),
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: '김민수',
    nickname: '민수',
    team: '개발팀',
    attendanceRecords: generateAttendanceRecords(),
  },
  {
    id: '2',
    name: '이서현',
    nickname: '서현',
    team: '디자인팀',
    attendanceRecords: generateAttendanceRecords(),
  },
  {
    id: '3',
    name: '박지훈',
    nickname: '지훈',
    team: '개발팀',
    attendanceRecords: generateAttendanceRecords(),
  },
  {
    id: '4',
    name: '최예진',
    nickname: '예진',
    team: '마케팅팀',
    attendanceRecords: generateAttendanceRecords(),
  },
  {
    id: '5',
    name: '정태윤',
    nickname: '태윤',
    team: '개발팀',
    attendanceRecords: generateAttendanceRecords(),
  },
  {
    id: '6',
    name: '한소영',
    nickname: '소영',
    team: '디자인팀',
    attendanceRecords: generateAttendanceRecords(),
  },
  {
    id: '7',
    name: '윤성민',
    nickname: '성민',
    team: '기획팀',
    attendanceRecords: generateAttendanceRecords(),
  },
  {
    id: '8',
    name: '장혜림',
    nickname: '혜림',
    team: '마케팅팀',
    attendanceRecords: generateAttendanceRecords(),
  },
];

export const teams = ['전체', '개발팀', '디자인팀', '마케팅팀', '기획팀'];

// 데일리 스크럼 모킹 데이터
export const getDailyScrum = (employeeId: string, date: string) => {
  const scrums = [
    "• 그리팅 미팅 (13:00)\n• 앱 이메일 인증 리팩토링\n• 스토어 이메일 수정\n• figma MCP, playwright MCP, cursor 연동 시연",
    "• 정기 미팅 (15:00)\n• 웹 4.12.1 배포\n• 대표 프로필 버그 수정\n• 앱 이메일 인증 리팩토링",
    "• 스프린트 회고 (16:00)\n• 결제 모듈 테스트 케이스 작성\n• 사용자 피드백 분석\n• AWS 인프라 최적화",
    "• 클라이언트 미팅 (14:00)\n• 디자인 시스템 v2.0 구현\n• 모바일 앱 성능 개선\n• 코드 리뷰 진행",
    "• 기획 회의 (10:30)\n• API 문서 업데이트\n• 데이터베이스 마이그레이션\n• 신규 기능 기술 검토",
    "• 마케팅 전략 회의 (11:00)\n• A/B 테스트 결과 분석\n• SEO 최적화 작업\n• 소셜 미디어 컨텐츠 제작",
    "• UX 리서치 미팅 (13:30)\n• 와이어프레임 수정\n• 프로토타입 제작\n• 사용성 테스트 준비",
    "• 개발팀 스탠드업 (09:30)\n• 버그 수정 및 QA\n• 배포 파이프라인 개선\n• 모니터링 시스템 점검"
  ];
  
  // employeeId와 date를 조합해서 일정한 인덱스를 생성
  const hashCode = (employeeId + date).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return scrums[Math.abs(hashCode) % scrums.length];
};

export const getDailyScrumSlackLink = (employeeId: string, date: string) => {
  // employeeId와 date를 조합해서 일정한 링크 생성
  const hashCode = (employeeId + date).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return `https://slack.com/archives/C123456789/${Math.abs(hashCode)}_daily_scrum_${employeeId}_${date}`;
};