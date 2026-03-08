// ==================== 类型定义 ====================
// 与后端接口对应的所有 TypeScript 类型

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'admin' | 'employee';
  department: string;
  position: string;
  avatar?: string;
  employeeId: string;
  phone: string;
  email: string;
  joinDate: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  manager: string;
  memberCount: number;
  children?: Department[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName?: string;
  department?: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave';
  clockInLocation?: { latitude: number; longitude: number };
  clockOutLocation?: { latitude: number; longitude: number };
  remark?: string;
}

export interface ClockInRequest {
  latitude: number;
  longitude: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  type: 'annual' | 'sick' | 'personal' | 'compensatory' | 'overtime' | 'business';
  typeName?: string;
  startDate: string;
  endDate: string;
  duration?: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverComment?: string;
  approverId?: string;
  approverName?: string;
  approvedAt?: string;
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

export interface PersonalStats {
  userId?: string;
  userName?: string;
  year?: number;
  month?: number;
  totalDays: number;
  normalDays: number;
  lateDays: number;
  earlyDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours?: number;
  attendanceRate?: number;
}

export interface DepartmentStats {
  department: string;
  total: number;
  present: number;
  late: number;
  absent: number;
  rate: number;
}

export interface DashboardData {
  // 管理员
  todayPresent?: number;
  todayAbsent?: number;
  todayLate?: number;
  pendingApprovals?: number;
  totalEmployees?: number;
  monthlyAttendanceRate?: number;
  // 员工
  todayClockedIn?: boolean;
  todayClockedOut?: boolean;
  todayClockInTime?: string;
  monthNormalDays?: number;
  monthLateDays?: number;
  monthEarlyDays?: number;
  pendingRequests?: number;
}

export interface CompanyLocation {
  latitude: number;
  longitude: number;
  name: string;
  radius: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
