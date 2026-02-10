const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Job {
  id: string;
  user_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input_format: string;
  output_format: string;
  original_filename: string;
  original_s3_key: string;
  converted_s3_key?: string;
  file_size_bytes: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ConversionHistory {
  id: string;
  user_id: string;
  job_id: string;
  input_format: string;
  output_format: string;
  original_s3_key: string;
  converted_s3_key: string;
  file_size_bytes: number;
  conversion_time_seconds: number;
  status: string;
  converted_at: string;
  created_at: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private getMultipartHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth APIs
  async register(username: string, email: string, password: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async getProfile(): Promise<{ user_id: string; username: string; email: string }> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  }

  // File Upload
  async uploadFile(
    file: File,
    outputFormat: string
  ): Promise<Job> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_format', outputFormat);

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: this.getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.job;
  }

  // Jobs
  async getJobs(): Promise<{ jobs: Job[] }> {
    const response = await fetch(`${this.baseURL}/jobs`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    return response.json();
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await fetch(`${this.baseURL}/jobs/${jobId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }

    const data = await response.json();
    return data as Job;
  }

  // Download
  async getDownloadUrl(jobId: string): Promise<{ download_url: string; expires_in: number }> {
    const response = await fetch(`${this.baseURL}/download/${jobId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get download URL');
    }

    return response.json();
  }

  // History
  async getHistory(filters?: {
    limit?: number;
    offset?: number;
    status?: string;
    format?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<{ history: ConversionHistory[]; total_count: number; limit: number; offset: number }> {
    const params = new URLSearchParams();
    if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.format) params.append('format', filters.format);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);

    const response = await fetch(`${this.baseURL}/history?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return response.json();
  }

  async deleteHistory(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/history/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete history');
    }

    return response.json();
  }

  async getHistoryStats(): Promise<{
    total_conversions: number;
    total_data_size_mb: number;
    format_breakdown: Record<string, number>;
    recent_activity: {
      id: string;
      input_format: string;
      output_format: string;
      converted_at: string;
      status: string;
    }[];
  }> {
    const response = await fetch(`${this.baseURL}/history/stats`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history stats');
    }

    return response.json();
  }
}

export const api = new ApiService();
