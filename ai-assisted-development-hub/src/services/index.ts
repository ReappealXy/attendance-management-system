// ==================== 各模块 API 服务 ====================
import { api, ApiError, type PageResult } from './api';
import type {
  User, LoginRequest, LoginResponse, Department, AttendanceRecord,
  ClockInRequest, LeaveRequest, AttendanceRule, LeaveType,
  PersonalStats, DepartmentStats, DashboardData, CompanyLocation,
  PasswordChangeRequest,
} from './types';

// ====== 本地 Mock 数据 fallback ======
import {
  mockUsers, mockDepartments, mockAttendanceRecords, mockLeaveRequests,
  mockAttendanceRules, mockLeaveTypes, getMonthlyStats, getDepartmentStats,
} from '@/lib/mock-data';

// 判断是否后端未就绪（网络错误时 fallback 到 mock）
function isFallback(e: unknown): boolean {
  return e instanceof ApiError && e.isNetworkError;
}

// ==================== 认证 ====================
export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await api.post<LoginResponse>('/auth/login', data);
      localStorage.setItem('attendance_token', res.data.token);
      localStorage.setItem('attendance_user', JSON.stringify(res.data.user));
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        // mock fallback
        const found = mockUsers.find(u => u.username === data.username);
        if (found) {
          const token = 'mock-jwt-token-' + found.id;
          localStorage.setItem('attendance_token', token);
          localStorage.setItem('attendance_user', JSON.stringify(found));
          return { token, tokenType: 'Bearer', expiresIn: 86400, user: found as any };
        }
        throw new ApiError(401, '用户名或密码错误');
      }
      throw e;
    }
  },

  async getMe(): Promise<User> {
    try {
      const res = await api.get<User>('/auth/me');
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        const saved = localStorage.getItem('attendance_user');
        if (saved) return JSON.parse(saved);
      }
      throw e;
    }
  },

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    try {
      await api.put('/auth/password', data);
    } catch (e) {
      if (isFallback(e)) return; // mock: 假装成功
      throw e;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    localStorage.removeItem('attendance_token');
    localStorage.removeItem('attendance_user');
  },
};

// ==================== 员工 ====================
export const employeeService = {
  async list(params?: { page?: number; pageSize?: number; keyword?: string; department?: string }): Promise<PageResult<User>> {
    try {
      const res = await api.get<PageResult<User>>('/employees', params);
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        const all = mockUsers.filter(u => {
          if (params?.keyword) {
            const k = params.keyword;
            if (!u.name.includes(k) && !u.employeeId.includes(k) && !u.phone.includes(k)) return false;
          }
          if (params?.department && params.department !== 'all' && u.department !== params.department) return false;
          return true;
        });
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 15;
        return {
          records: all.slice((page - 1) * pageSize, page * pageSize) as any,
          total: all.length,
          page,
          pageSize,
          totalPages: Math.ceil(all.length / pageSize),
        };
      }
      throw e;
    }
  },

  async getById(id: string): Promise<User> {
    try {
      const res = await api.get<User>(`/employees/${id}`);
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        const u = mockUsers.find(u => u.id === id);
        if (u) return u as any;
      }
      throw e;
    }
  },

  async create(data: Partial<User> & { password?: string }): Promise<User> {
    const res = await api.post<User>('/employees', data);
    return res.data;
  },

  async update(id: string, data: Partial<User> & { password?: string }): Promise<User> {
    const res = await api.put<User>(`/employees/${id}`, data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },
};

// ==================== 部门 ====================
export const departmentService = {
  async list(): Promise<Department[]> {
    try {
      const res = await api.get<Department[]>('/departments');
      return res.data;
    } catch (e) {
      if (isFallback(e)) return mockDepartments as any;
      throw e;
    }
  },

  async create(data: { name: string; parentId?: string | null; manager?: string }): Promise<Department> {
    const res = await api.post<Department>('/departments', data);
    return res.data;
  },

  async update(id: string, data: Partial<Department>): Promise<Department> {
    const res = await api.put<Department>(`/departments/${id}`, data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  },
};

// ==================== 考勤打卡 ====================
export const attendanceService = {
  async clockIn(data: ClockInRequest): Promise<AttendanceRecord> {
    const res = await api.post<AttendanceRecord>('/attendance/clock-in', data);
    return res.data;
  },

  async clockOut(data: ClockInRequest): Promise<AttendanceRecord> {
    const res = await api.post<AttendanceRecord>('/attendance/clock-out', data);
    return res.data;
  },

  async getToday(): Promise<{ hasClockedIn: boolean; hasClockedOut: boolean; clockInTime?: string; clockOutTime?: string; status?: string }> {
    try {
      const res = await api.get<any>('/attendance/today');
      return res.data;
    } catch (e) {
      if (isFallback(e)) return { hasClockedIn: false, hasClockedOut: false };
      throw e;
    }
  },

  async getMyRecords(params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string; status?: string }): Promise<PageResult<AttendanceRecord>> {
    try {
      const res = await api.get<PageResult<AttendanceRecord>>('/attendance/my', params);
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        const saved = localStorage.getItem('attendance_user');
        const userId = saved ? JSON.parse(saved).id : '1';
        const records = mockAttendanceRecords.filter(r => r.userId === userId).slice(0, 15);
        return { records: records as any, total: records.length, page: 1, pageSize: 15, totalPages: 1 };
      }
      throw e;
    }
  },

  async getAllRecords(params?: { page?: number; pageSize?: number; userId?: string; department?: string; startDate?: string; endDate?: string; status?: string }): Promise<PageResult<AttendanceRecord>> {
    try {
      const res = await api.get<PageResult<AttendanceRecord>>('/attendance', params);
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        const records = mockAttendanceRecords.slice(0, 50);
        return { records: records as any, total: records.length, page: 1, pageSize: 50, totalPages: 1 };
      }
      throw e;
    }
  },
};

// ==================== 请假/审批 ====================
export const leaveService = {
  async list(params?: { page?: number; pageSize?: number; status?: string; type?: string; userId?: string }): Promise<PageResult<LeaveRequest>> {
    try {
      const res = await api.get<PageResult<LeaveRequest>>('/leave-requests', params);
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        let filtered = [...mockLeaveRequests] as any[];
        if (params?.status && params.status !== 'all') filtered = filtered.filter(r => r.status === params.status);
        return { records: filtered, total: filtered.length, page: 1, pageSize: 50, totalPages: 1 };
      }
      throw e;
    }
  },

  async create(data: { type: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest> {
    const res = await api.post<LeaveRequest>('/leave-requests', data);
    return res.data;
  },

  async approve(id: string, comment?: string): Promise<void> {
    await api.put(`/leave-requests/${id}/approve`, { comment: comment || '同意' });
  },

  async reject(id: string, comment?: string): Promise<void> {
    await api.put(`/leave-requests/${id}/reject`, { comment: comment || '不符合条件' });
  },

  async cancel(id: string): Promise<void> {
    await api.delete(`/leave-requests/${id}`);
  },
};

// ==================== 考勤规则 ====================
export const ruleService = {
  async listRules(): Promise<AttendanceRule[]> {
    try {
      const res = await api.get<AttendanceRule[]>('/attendance-rules');
      return res.data;
    } catch (e) {
      if (isFallback(e)) return mockAttendanceRules as any;
      throw e;
    }
  },

  async updateRule(id: string, data: Partial<AttendanceRule>): Promise<AttendanceRule> {
    const res = await api.put<AttendanceRule>(`/attendance-rules/${id}`, data);
    return res.data;
  },

  async createRule(data: Partial<AttendanceRule>): Promise<AttendanceRule> {
    const res = await api.post<AttendanceRule>('/attendance-rules', data);
    return res.data;
  },

  async deleteRule(id: string): Promise<void> {
    await api.delete(`/attendance-rules/${id}`);
  },

  async listLeaveTypes(): Promise<LeaveType[]> {
    try {
      const res = await api.get<LeaveType[]>('/leave-types');
      return res.data;
    } catch (e) {
      if (isFallback(e)) return mockLeaveTypes as any;
      throw e;
    }
  },
};

// ==================== 统计 ====================
export const statisticsService = {
  async getPersonalStats(params?: { userId?: string; year?: number; month?: number }): Promise<PersonalStats> {
    try {
      const res = await api.get<PersonalStats>('/statistics/personal', params);
      return res.data;
    } catch (e) {
      if (isFallback(e)) return getMonthlyStats(params?.userId) as any;
      throw e;
    }
  },

  async getDepartmentStats(params?: { date?: string }): Promise<DepartmentStats[]> {
    try {
      const res = await api.get<DepartmentStats[]>('/statistics/departments', params);
      return res.data;
    } catch (e) {
      if (isFallback(e)) return getDepartmentStats() as any;
      throw e;
    }
  },

  async getDashboard(): Promise<DashboardData> {
    try {
      const res = await api.get<DashboardData>('/statistics/dashboard');
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        // mock dashboard
        return {
          todayPresent: 185, todayAbsent: 15, todayLate: 8,
          pendingApprovals: 12, totalEmployees: 400,
          monthNormalDays: 18, monthLateDays: 2, monthEarlyDays: 0, pendingRequests: 1,
        };
      }
      throw e;
    }
  },

  async exportReport(params: { year: number; month: number; department?: string; format?: string }): Promise<Blob> {
    return api.download('/statistics/export', params);
  },
};

// ==================== 公司配置 ====================
export const configService = {
  async getLocation(): Promise<CompanyLocation> {
    try {
      const res = await api.get<CompanyLocation>('/company-config/location');
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        const saved = localStorage.getItem('company_location');
        if (saved) {
          const p = JSON.parse(saved);
          return { latitude: p.lat, longitude: p.lng, name: p.name, radius: p.radius };
        }
        return { latitude: 29.5647, longitude: 106.2965, name: '重庆人文科技学院', radius: 500 };
      }
      throw e;
    }
  },

  async updateLocation(data: CompanyLocation): Promise<CompanyLocation> {
    try {
      const res = await api.put<CompanyLocation>('/company-config/location', data);
      // 同步到 localStorage（前端兼容）
      localStorage.setItem('company_location', JSON.stringify({
        lat: data.latitude, lng: data.longitude, name: data.name, radius: data.radius,
      }));
      return res.data;
    } catch (e) {
      if (isFallback(e)) {
        localStorage.setItem('company_location', JSON.stringify({
          lat: data.latitude, lng: data.longitude, name: data.name, radius: data.radius,
        }));
        return data;
      }
      throw e;
    }
  },
};

// ==================== AI ====================
export const aiService = {
  async chat(messages: { role: string; content: string }[]): Promise<{ content: string; role: string }> {
    const res = await api.post<{ content: string; role: string }>('/ai/chat', { messages });
    return res.data;
  },

  async summary(data: { type: string; userId?: string; data: any }): Promise<{ content: string }> {
    const res = await api.post<{ content: string }>('/ai/summary', data);
    return res.data;
  },
};
