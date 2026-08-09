import axios from 'axios';
import { config as appConfig } from './config';
import { User } from '@/context/AuthContext';

const API_URL = appConfig.apiUrl;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export type RoleEnum =
  | 'super_admin'
  | 'admin'
  | 'research'
  | 'coordinator'
  | 'teacher'
  | 'vicerrectorado'
  | 'director_investigacion'
  | 'jefe_investigacion';

// --- Career / Gestion ---

export interface Career {
  id: number;
  name: string;
  faculty: string;
}

export interface AcademicActivity {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  category?: string | null;
  category_id?: number | null;
  origin_color?: string | null;
  career_id?: number | null;
  gestion_id: number;
  activity_category?: ActivityCategory | null;
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

export interface ScientificActivityEvidence {
  id: number;
  scientific_activity_id: number;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by_id?: number | null;
}

export interface ActivityCategory {
  id: number;
  name: string;
  code: string;
  scope: 'academic' | 'scientific' | 'both';
  color?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScientificActivity {
  id: number;
  title: string;
  activity_type: ScientificActivityType;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  responsible_name: string;
  notes?: string | null;
  career_id?: number | null;
  gestion_id: number;
  status: ScientificActivityStatus;
  evidence_url?: string | null;
  evidences?: ScientificActivityEvidence[];
  category_id?: number | null;
  activity_category?: ActivityCategory | null;
  collaboration_career_ids?: number[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ScientificActivityFilters {
  career_id?: number;
  gestion_id?: number;
  start_date?: string;
  end_date?: string;
}

// --- Reports ---

export type ReportFormat = 'pdf' | 'excel';
export type ReportType = 'table' | 'research-agenda' | 'conflict' | 'agenda-completa' | 'agenda-academica' | 'agenda-cientifica' | 'seguimiento-cumplimiento' | 'seguimiento';

export interface SeguimientoCareerStat {
  career_id: number | null;
  career_name: string;
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  completion_rate: number;
}

export interface SeguimientoStatsResponse {
  gestion_name: string;
  career_name: string;
  now_str: string;
  careers_summary: SeguimientoCareerStat[];
  totals: {
    total: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    completion_rate: number;
  };
}

export interface ReportGenerateRequest {
  career_id: number | null;
  gestion_id: number;
  format: ReportFormat;
  report_type: ReportType;
}

export interface ReportGenerateResponse {
  task_id: string;
}

export interface ReportStatusResponse {
  status: string;
  result?: {
    file_path?: string;
    file_name?: string;
  };
  error?: string;
}

// --- Conflicts ---

export interface ConflictItem {
  academic_id: number;
  academic_title: string;
  academic_start_date: string;
  academic_end_date: string;
  scientific_id: number;
  scientific_title: string;
  scientific_start_date: string;
  scientific_end_date: string;
}

export interface ConflictListResponse {
  conflicts: ConflictItem[];
}

export interface ConflictFilters {
  career_id?: number | null;
  gestion_id: number;
}


// --- Fusion / Merged Calendar ---

export type SourceType = 'academic' | 'scientific';

export interface MergedCalendarItem {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  source_type: SourceType;
  scope: 'global' | 'career';
  career_id?: number | null;
  career_name?: string | null;
  category?: string | null;
  origin_color?: string | null;
  activity_type?: ScientificActivityType | null;
  status?: ScientificActivityStatus | null;
  responsible_name?: string | null;
}

export interface MergedCalendarResponse {
  items: MergedCalendarItem[];
}

export interface MergedCalendarFilters {
  career_id?: number;
  gestion_id?: number;
  start_date?: string;
  end_date?: string;
}

// --- Dashboard Stats ---

export interface DashboardStats {
  active_gestion: {
    id: number | null;
    name: string | null;
  };
  counts: {
    total_academic: number;
    total_scientific: number;
    upcoming_events: number;
    upcoming_scientific: number;
  };
  status_breakdown: Record<string, number>;
  next_events: {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    activity_type: string | null;
    status: string | null;
    career_id: number;
  }[];
}

// --- API namespaces ---

export const api = {
  fusion: {
    getMerged: (params?: MergedCalendarFilters) =>
      apiClient.get<MergedCalendarResponse>('/fusion/', { params }).then((res) => res.data),
  },
  importacion: {
    downloadTemplate: () =>
      apiClient
        .get<Blob>('/importacion/template/download', { responseType: 'blob' })
        .then((res) => res.data),
  },
  academic: {
    upload: (formData: FormData) =>
      apiClient.post('/importacion/upload-excel', formData, {
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
    updateStatus: (id: number, status: ScientificActivityStatus, evidence_url?: string, notes?: string) =>
      apiClient.put(`/scientific/${id}/status`, { status, evidence_url, notes }).then((res) => res.data),
    delete: (id: number) => apiClient.delete(`/scientific/${id}`).then((res) => res.data),
    uploadEvidence: (activityId: number, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient
        .post<ScientificActivityEvidence>(`/scientific/${activityId}/evidence`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => res.data);
    },
    listEvidences: (activityId: number) =>
      apiClient.get<ScientificActivityEvidence[]>(`/scientific/${activityId}/evidence`).then((res) => res.data),
    deleteEvidence: (evidenceId: number) =>
      apiClient.delete(`/scientific/evidence/${evidenceId}`).then((res) => res.data),
  },
  categories: {
    list: (scope?: string, include_inactive: boolean = false) =>
      apiClient
        .get<ActivityCategory[]>('/categories/', { params: { scope, include_inactive } })
        .then((res) => res.data),
    get: (id: number) =>
      apiClient.get<ActivityCategory>(`/categories/${id}`).then((res) => res.data),
    create: (data: Partial<ActivityCategory>) =>
      apiClient.post<ActivityCategory>('/categories/', data).then((res) => res.data),
    update: (id: number, data: Partial<ActivityCategory>) =>
      apiClient.put<ActivityCategory>(`/categories/${id}`, data).then((res) => res.data),
    delete: (id: number) =>
      apiClient.delete<ActivityCategory>(`/categories/${id}`).then((res) => res.data),
  },
  careers: {
    list: () => apiClient.get<Career[]>('/careers/').then((res) => res.data),
  },
  gestiones: {
    list: () => apiClient.get<Gestion[]>('/gestiones/').then((res) => res.data),
  },
  dashboard: {
    stats: () => apiClient.get<DashboardStats>('/dashboard/stats').then((res) => res.data),
  },
  auth: {
    login: (username: string, password: string) => {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      return apiClient
        .post('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .then((res) => res.data);
    },
  },
  users: {
    me: () => apiClient.get('/users/me').then((res) => res.data),
    updateMe: (data: {
      full_name?: string | null;
      email?: string | null;
      phone_number?: string | null;
      telegram_chat_id?: string | null;
    }) => apiClient.patch('/users/me', data).then((res) => res.data),
    testTelegram: () => apiClient.post('/users/me/test-telegram').then((res) => res.data),
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
    getSeguimientoStats: (gestion_id: number, career_id?: number | null) =>
      apiClient
        .get<SeguimientoStatsResponse>('/reports/seguimiento/stats', {
          params: { gestion_id, career_id },
        })
        .then((res) => res.data),
  },
  conflicts: {
    list: (filters: ConflictFilters) =>
      apiClient
        .get<ConflictListResponse>('/conflicts/', { params: filters })
        .then((res) => res.data),
  },
};
