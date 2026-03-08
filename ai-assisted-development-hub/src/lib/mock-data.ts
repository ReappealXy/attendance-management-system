// Mock用户数据 - 200条打桩数据
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'employee';
  department: string;
  position: string;
  avatar?: string;
  employeeId: string;
  phone: string;
  email: string;
  joinDate: string;
}

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  manager: string;
  memberCount: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave';
  remark?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  type: 'annual' | 'sick' | 'personal' | 'compensatory' | 'overtime' | 'business';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverComment?: string;
  createdAt: string;
}

export interface AttendanceRule {
  id: string;
  name: string;
  clockInTime: string;
  clockOutTime: string;
  lateThreshold: number;
  earlyThreshold: number;
  isDefault: boolean;
}

export interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
  requireApproval: boolean;
}

// ====== 姓氏和名字库 ======
const surnames = ['张', '李', '王', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '林', '何', '高', '罗', '郑', '梁', '谢', '宋', '唐', '韩', '曹', '许', '邓', '冯', '曾', '彭', '萧', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶'];
const givenNames = ['明远', '思涵', '佳琪', '志豪', '雨萱', '浩然', '欣怡', '子轩', '梓涵', '一诺', '宇航', '诗琪', '俊杰', '美琳', '天翔', '雅馨', '文博', '语嫣', '晨曦', '若彤', '嘉豪', '静怡', '泽宇', '紫萱', '昊天', '梦瑶', '鹏飞', '雪晴', '建国', '淑芳', '伟强', '丽华', '国庆', '秀英', '永强', '桂兰', '德华', '翠花', '军伟', '春梅'];

const departments = ['技术部', '市场部', '人事部', '财务部', '运营部', '产品部', '客服部', '行政部'];
const positions: Record<string, string[]> = {
  '技术部': ['前端工程师', '后端工程师', '测试工程师', '架构师', '运维工程师', 'DevOps工程师'],
  '市场部': ['市场专员', '品牌经理', '渠道专员', '市场总监助理', '推广专员'],
  '人事部': ['HR专员', '招聘专员', '培训专员', 'HRBP', '薪酬专员'],
  '财务部': ['会计', '出纳', '财务分析师', '审计专员', '税务专员'],
  '运营部': ['运营专员', '数据分析师', '内容运营', '活动策划', '用户运营'],
  '产品部': ['产品经理', '产品助理', 'UI设计师', 'UX设计师', '需求分析师'],
  '客服部': ['客服专员', '客服主管', '投诉处理专员', '售后专员'],
  '行政部': ['行政专员', '前台', '后勤管理', '文员', '采购专员'],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  const prefixes = ['138', '139', '136', '137', '135', '150', '151', '152', '188', '189'];
  return randomItem(prefixes) + Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const d = new Date(start + Math.random() * (end - start));
  return d.toISOString().split('T')[0];
}

// ====== 生成200个用户 ======
function generateUsers(): User[] {
  const users: User[] = [
    {
      id: '1', username: 'admin', name: '张明远', role: 'admin',
      department: '技术部', position: '技术总监', employeeId: 'EMP001',
      phone: '13800138001', email: 'zhangmy@company.com', joinDate: '2020-03-15',
    },
  ];

  for (let i = 2; i <= 200; i++) {
    const dept = randomItem(departments);
    const pos = randomItem(positions[dept]);
    const surname = randomItem(surnames);
    const given = randomItem(givenNames);
    const name = surname + given;
    const paddedId = i.toString().padStart(3, '0');

    users.push({
      id: String(i),
      username: i <= 5 ? `employee${i - 1}` : `user${paddedId}`,
      name,
      role: i <= 3 ? 'admin' : 'employee',
      department: dept,
      position: pos,
      employeeId: `EMP${paddedId}`,
      phone: generatePhone(),
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}${i}@company.com`,
      joinDate: generateDate(2018, 2025),
    });
  }

  return users;
}

export const mockUsers = generateUsers();

export const mockDepartments: Department[] = [
  { id: '1', name: '技术部', parentId: null, manager: '张明远', memberCount: 35 },
  { id: '2', name: '市场部', parentId: null, manager: '刘芳', memberCount: 25 },
  { id: '3', name: '人事部', parentId: null, manager: '周蕾', memberCount: 18 },
  { id: '4', name: '财务部', parentId: null, manager: '吴强', memberCount: 15 },
  { id: '5', name: '运营部', parentId: null, manager: '杨帆', memberCount: 28 },
  { id: '6', name: '产品部', parentId: null, manager: '赵磊', memberCount: 22 },
  { id: '7', name: '客服部', parentId: null, manager: '孙丽', memberCount: 30 },
  { id: '8', name: '行政部', parentId: null, manager: '马超', memberCount: 12 },
  { id: '9', name: '前端组', parentId: '1', manager: '李思涵', memberCount: 12 },
  { id: '10', name: '后端组', parentId: '1', manager: '赵雨萱', memberCount: 10 },
  { id: '11', name: '测试组', parentId: '1', manager: '陈晓', memberCount: 8 },
  { id: '12', name: '品牌组', parentId: '2', manager: '林月', memberCount: 10 },
  { id: '13', name: '渠道组', parentId: '2', manager: '何杰', memberCount: 8 },
];

// 生成最近30天考勤记录（200人 x 工作日）
function generateAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const dateStr = date.toISOString().split('T')[0];

    mockUsers.forEach(user => {
      const rand = Math.random();
      let status: AttendanceRecord['status'] = 'normal';
      let clockIn = '08:' + (30 + Math.floor(Math.random() * 28)).toString();
      let clockOut = '18:0' + Math.floor(Math.random() * 10);

      if (rand < 0.08) {
        status = 'late';
        clockIn = '09:' + (10 + Math.floor(Math.random() * 50)).toString().padStart(2, '0');
      } else if (rand < 0.12) {
        status = 'early';
        clockOut = '17:' + Math.floor(Math.random() * 30).toString().padStart(2, '0');
      } else if (rand < 0.14) {
        status = 'absent';
        clockIn = null;
        clockOut = null;
      } else if (rand < 0.17) {
        status = 'leave';
        clockIn = null;
        clockOut = null;
      }

      records.push({
        id: `att-${user.id}-${dateStr}`,
        userId: user.id,
        date: dateStr,
        clockIn,
        clockOut,
        status,
      });
    });
  }
  return records;
}

export const mockAttendanceRecords = generateAttendanceRecords();

// 生成请假/审批记录
const leaveReasons: Record<string, string[]> = {
  annual: ['回老家探亲', '家庭旅行', '个人事务处理', '婚礼参加', '搬家'],
  sick: ['感冒发烧', '肠胃不适', '牙痛就医', '腰椎不适需休息', '过敏需要治疗'],
  personal: ['处理个人事务', '家中水管维修', '陪家人看病', '办理证件', '接送孩子'],
  overtime: ['项目上线需加班', '紧急Bug修复', '客户演示准备', '季度结算', '系统迁移'],
  business: ['参加行业招聘会', '客户拜访', '分公司出差', '参加培训', '展会参展'],
  compensatory: ['之前加班调休', '国庆加班补休', '周末加班调休'],
};

function generateLeaveRequests(): LeaveRequest[] {
  const requests: LeaveRequest[] = [];
  const types: LeaveRequest['type'][] = ['annual', 'sick', 'personal', 'compensatory', 'overtime', 'business'];
  const statuses: LeaveRequest['status'][] = ['pending', 'approved', 'rejected'];

  for (let i = 0; i < 50; i++) {
    const user = mockUsers[Math.floor(3 + Math.random() * 197)];
    const type = randomItem(types);
    const status = i < 15 ? 'pending' : randomItem(statuses);
    const startDay = Math.floor(Math.random() * 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + startDay - 15);
    const duration = 1 + Math.floor(Math.random() * 3);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    requests.push({
      id: `lr-${i + 1}`,
      userId: user.id,
      userName: user.name,
      department: user.department,
      type,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reason: randomItem(leaveReasons[type]),
      status,
      approverComment: status === 'approved' ? '同意' : status === 'rejected' ? '不符合条件' : undefined,
      createdAt: new Date(startDate.getTime() - 86400000).toISOString().split('T')[0],
    });
  }

  return requests;
}

export const mockLeaveRequests = generateLeaveRequests();

export const mockAttendanceRules: AttendanceRule[] = [
  { id: '1', name: '标准班次', clockInTime: '09:00', clockOutTime: '18:00', lateThreshold: 15, earlyThreshold: 15, isDefault: true },
  { id: '2', name: '弹性班次', clockInTime: '10:00', clockOutTime: '19:00', lateThreshold: 30, earlyThreshold: 30, isDefault: false },
  { id: '3', name: '早班', clockInTime: '07:00', clockOutTime: '16:00', lateThreshold: 10, earlyThreshold: 10, isDefault: false },
];

export const mockLeaveTypes: LeaveType[] = [
  { id: '1', name: '年假', maxDays: 15, requireApproval: true },
  { id: '2', name: '事假', maxDays: 10, requireApproval: true },
  { id: '3', name: '病假', maxDays: 30, requireApproval: true },
  { id: '4', name: '调休', maxDays: 5, requireApproval: true },
  { id: '5', name: '婚假', maxDays: 10, requireApproval: true },
  { id: '6', name: '产假', maxDays: 90, requireApproval: true },
  { id: '7', name: '丧假', maxDays: 3, requireApproval: true },
];

// 统计数据
export const getMonthlyStats = (userId?: string) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const records = mockAttendanceRecords.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && (!userId || r.userId === userId);
  });

  return {
    totalDays: records.length,
    normalDays: records.filter(r => r.status === 'normal').length,
    lateDays: records.filter(r => r.status === 'late').length,
    earlyDays: records.filter(r => r.status === 'early').length,
    absentDays: records.filter(r => r.status === 'absent').length,
    leaveDays: records.filter(r => r.status === 'leave').length,
  };
};

export const getDepartmentStats = () => {
  return mockDepartments.filter(d => !d.parentId).map(dept => {
    const deptUsers = mockUsers.filter(u => u.department === dept.name);
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = mockAttendanceRecords.filter(
      r => r.date === today && deptUsers.some(u => u.id === r.userId)
    );
    return {
      department: dept.name,
      total: dept.memberCount,
      present: todayRecords.filter(r => r.clockIn).length,
      late: todayRecords.filter(r => r.status === 'late').length,
      absent: dept.memberCount - todayRecords.filter(r => r.clockIn).length,
      rate: deptUsers.length > 0
        ? Math.round((todayRecords.filter(r => r.clockIn).length / dept.memberCount) * 100)
        : 0,
    };
  });
};
