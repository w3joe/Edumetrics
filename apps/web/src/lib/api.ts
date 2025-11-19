const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.details) {
        errorMessage = Array.isArray(errorData.details) 
          ? errorData.details.map((d: any) => d.message || JSON.stringify(d)).join(', ')
          : String(errorData.details);
      }
    } catch {
      // If response is not JSON, try to get text
      try {
        const text = await response.text();
        errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export const api = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  getClasses: () => apiRequest<Array<{
    id: string;
    name: string;
    studentCount: number;
    assignmentCount: number;
  }>>('/classes'),
  
  getClassRoster: (classId: string) =>
    apiRequest<Array<{
      id: string;
      name: string;
      email?: string;
    }>>(`/classes/${classId}/roster`),
  
  getClassMetrics: (classId: string) =>
    apiRequest<Array<{
      studentId: string;
      studentName: string;
      avgScorePct: number | null;
      sessionsThisWeek: number;
      avgAccuracyPct: number | null;
      recentMood: number | null;
    }>>(`/classes/${classId}/metrics`),
  
  getClassAssignments: (classId: string) =>
    apiRequest<Array<{
      id: string;
      title: string;
      topic: string;
      dueAt: string;
      timeEstimateMin: number;
    }>>(`/classes/${classId}/assignments`),
  
  createAssignment: (data: {
    classId: string;
    title: string;
    topic: string;
    dueAt: string;
    timeEstimateMin: number;
  }) =>
    apiRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

