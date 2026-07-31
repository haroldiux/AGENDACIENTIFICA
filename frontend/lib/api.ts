import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Career / Gestion ---

export interface Career {
  id: number;
  name: string;
  faculty: string;
}

export interface Gestion {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

// --- Scientific activities ---

export type ScientificActivityType =
  | 'congreso'
  | 'webinar'
  | 'defensa'
  | 'feria'
  | 'olimpiada'
  | 'master_class';

export type ScientificActivityStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ScientificActivity {
  id: number;
  title: string;
  activity_type: ScientificActivityType;
  start_date: string;
  end_date: string;
  responsible_name: string;
  notes?: string | null;
  career_id: number;
  gestion_id: number;
  status: ScientificActivityStatus;
  evidence_url?: string | null;
}

export interface ScientificActivityFilters {
  career_id?: number;
  gestion_id?: number;
  start_date?: string;
  end_date?: string;
}

// --- Reports ---

export type ReportFormat = 'pdf';
export type ReportType = 'table' | 'research-agenda';

export interface ReportGenerateRequest {
  career_id: number;
  gestion_id: number;
  format: ReportFormat;
  report_type: ReportType;
}

export interface ReportGenerateResponse {
  task_id: string;
}

export interface ReportStatusResponse {
  status: 'pending' | 'started' | 'completed' | 'failed';
  file_path?: string;
  file_name?: string;
  error?: string;
}

// --- API namespaces ---

export const api = {
  fusion: {
    getMerged: (params?: Record<string, unknown>) =>
      apiClient.get('/fusion/merged', { params }).then((res) => res.data),
  },
  academic: {
    upload: (formData: FormData) =>
      apiClient.post('/academic/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((res) => res.data),
    list: () => apiClient.get('/academic/').then((res) => res.data),
  },
  scientific: {
    list: (filters?: ScientificActivityFilters) =>
      apiClient.get<ScientificActivity[]>('/scientific/', { params: filters }).then((res) => res.data),
    create: (data: Record<string, unknown>) =>
      apiClient.post('/scientific/', data).then((res) => res.data),
    update: (id: number, data: Record<string, unknown>) =>
      apiClient.put(`/scientific/${id}`, data).then((res) => res.data),
    delete: (id: number) => apiClient.delete(`/scientific/${id}`).then((res) => res.data),
  },
  careers: {
    list: () => apiClient.get<Career[]>('/careers/').then((res) => res.data),
  },
  gestiones: {
    list: () => apiClient.get<Gestion[]>('/gestiones/').then((res) => res.data),
  },
  auth: {
    login: (credentials: Record<string, unknown>) =>
      apiClient.post('/auth/login', credentials).then((res) => res.data),
  },
  reports: {
    generate: (payload: ReportGenerateRequest) =>
      apiClient
        .post<ReportGenerateResponse>('/reports/generate', payload)
        .then((res) => res.data),
    status: (taskId: string) =>
      apiClient
        .get<ReportStatusResponse>(`/reports/${taskId}/status`)
        .then((res) => res.data),
    download: (taskId: string) =>
      apiClient
        .get<Blob>(`/reports/${taskId}/download`, { responseType: 'blob' })
        .then((res) => res.data),
  },
};
