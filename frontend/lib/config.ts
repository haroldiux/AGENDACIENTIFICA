const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const config = {
  apiUrl: NEXT_PUBLIC_API_URL,
  apiHost: NEXT_PUBLIC_API_URL.replace('/api/v1', ''),
};
