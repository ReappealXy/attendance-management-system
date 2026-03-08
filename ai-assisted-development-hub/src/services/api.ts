// ==================== 统一API请求层 ====================
// 所有后端请求都通过此模块发出，自动携带JWT、处理错误

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  errors?: { field: string; message: string }[];
}

export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('attendance_token');
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    options?: { responseType?: 'json' | 'blob' }
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // 401 未授权 → 清除token跳转登录
      if (response.status === 401) {
        localStorage.removeItem('attendance_token');
        localStorage.removeItem('attendance_user');
        window.location.href = '/login';
        throw new Error('未登录或登录已过期');
      }

      // blob 响应（文件下载）
      if (options?.responseType === 'blob') {
        const blob = await response.blob();
        return { code: 200, message: 'success', data: blob as any };
      }

      // 204 No Content
      if (response.status === 204) {
        return { code: 204, message: '操作成功', data: null as any };
      }

      const json = await response.json();

      if (!response.ok) {
        throw new ApiError(json.code || response.status, json.message || '请求失败', json.errors);
      }

      return json;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // 网络错误 → 返回 mock fallback 标记
      throw new ApiError(0, '网络错误，无法连接到服务器', undefined, true);
    }
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params
      ? '?' + Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')
      : '';
    return this.request<T>('GET', path + queryString);
  }

  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }

  async download(path: string, params?: Record<string, any>): Promise<Blob> {
    const queryString = params
      ? '?' + Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')
      : '';
    const res = await this.request<Blob>('GET', path + queryString, undefined, { responseType: 'blob' });
    return res.data;
  }
}

export class ApiError extends Error {
  code: number;
  errors?: { field: string; message: string }[];
  isNetworkError: boolean;

  constructor(code: number, message: string, errors?: { field: string; message: string }[], isNetworkError = false) {
    super(message);
    this.code = code;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
  }
}

export const api = new ApiClient(API_BASE);
