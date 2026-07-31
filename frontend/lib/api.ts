import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  fusion: {
    getMerged: (params?: any) => apiClient.get('/fusion/merged', { params }).then(res => res.data),
  },
  academic: {
    upload: (formData: FormData) => apiClient.post('/academic/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
    list: () => apiClient.get('/academic/').then(res => res.data),
  },
  scientific: {
    list: (params?: any) => apiClient.get('/scientific/', { params }).then(res => res.data),
    create: (data: any) => apiClient.post('/scientific/', data).then(res => res.data),
    update: (id: number, data: any) => apiClient.put(`/scientific/${id}`, data).then(res => res.data),
    delete: (id: number) => apiClient.delete(`/scientific/${id}`).then(res => res.data),
  },
  careers: {
    list: () => apiClient.get('/careers/').then(res => res.data),
  },
  gestiones: {
    list: () => apiClient.get('/gestiones/').then(res => res.data),
  },
  auth: {
    login: (credentials: any) => apiClient.post('/auth/login', credentials).then(res => res.data),
  }
};
