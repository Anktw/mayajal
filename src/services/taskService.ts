import { getSessionCookie } from "@/utils/getCookie";

const FAST_URL = process.env.FAST_URL || '';

export interface Task {
  taskid: number;
  username: string;
  estimated_time: number;
  completion_time?: string | null;
  completed?: boolean;
  created_at: string;
}

export interface SavedTask {
  id: number;
  taskidbyfrontend: number; // Fix: Change from method to property
  name: string;
  estimated_time: number;
}

interface BackendSavedTask {
  id: number;
  taskidbyfrontend: number;
  name: string;
  estimated_time: number;
  username: string;
}

interface SavedTaskInput {
  username: string;
  name: string;
  estimated_time: number;
  taskidbyfrontend: number;
}

function getAuthFetchOptions(method: string = 'GET', body?: any): RequestInit {
  const sessionCookie = getSessionCookie();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (sessionCookie) {
    headers['Cookie'] = `session=${sessionCookie}`;
  }
  return {
    method,
    headers,
    credentials: 'include' as RequestCredentials,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

// --- INFINITE RETRY UTILITY ---
export async function retryUntilSuccess<T>(fn: () => Promise<T>, delay = 2000): Promise<T> {
  while (true) {
    try {
      const result = await fn();
      if (result !== null && result !== undefined) return result;
    } catch (e) {
      // continue
    }
    await new Promise((res) => setTimeout(res, delay));
  }
}

// --- TASKS ---
export async function fetchAllTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`/api/lockin/tasks`, getAuthFetchOptions());
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function addTaskAPI(payload: {
  username: string;
  estimated_time: number;
  completion_time?: string;
  completed?: boolean;
}): Promise<Task | null> {
  try {
    const response = await fetch(
      `/api/lockin/tasks`,
      getAuthFetchOptions('POST', payload)
    );
    if (!response.ok) {
      throw new Error('Failed to add task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
}

export async function updateTaskAPI(taskid: number, payload: {
  username?: string;
  estimated_time?: number;
  completion_time?: string;
  completed?: boolean;
}): Promise<Task | null> {
  try {
    const response = await fetch(
      `/api/lockin/tasks/${taskid}`,
      getAuthFetchOptions('PUT', payload)
    );
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

export async function deleteTaskAPI(taskid: number): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/lockin/tasks/${taskid}`,
      getAuthFetchOptions('DELETE')
    );
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// --- SAVED TASKS ---
export async function fetchSavedTasks(): Promise<SavedTask[]> {
  try {
    const response = await fetch(`/api/lockin/saved-tasks`, getAuthFetchOptions());
    if (!response.ok) {
      throw new Error('Failed to fetch saved tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching saved tasks:', error);
    return [];
  }
}

export async function addSavedTaskAPI(task: SavedTaskInput): Promise<BackendSavedTask> {
  const response = await fetch(
    '/api/lockin/saved-tasks',
    getAuthFetchOptions('POST', task)
  );
  if (!response.ok) throw new Error('Failed to add saved task');
  return response.json();
}

export async function updateSavedTaskAPI(id: number, task: SavedTaskInput): Promise<BackendSavedTask> {
  const response = await fetch(
    `/api/lockin/saved-tasks/${id}`,
    getAuthFetchOptions('PUT', task)
  );
  if (!response.ok) throw new Error('Failed to update saved task');
  return response.json();
}

export async function deleteSavedTaskAPI(id: number): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/lockin/saved-tasks/${id}`,
      getAuthFetchOptions('DELETE')
    );
    if (!response.ok) {
      throw new Error('Failed to delete saved task');
    }
    return true;
  } catch (error) {
    console.error('Error deleting saved task:', error);
    return false;
  }
}
