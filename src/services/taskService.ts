// All logged-in features disabled for deployment

export interface Task {
  taskid: number;
  taskidbyfrontend: number;
  username: string;
  estimated_time: number;
  completion_time?: string | null;
  completed?: boolean;
  created_at: string;
}

export interface SavedTask {
  id: number;
  name: string;
  estimated_time: number;
}

// Dummy implementations to prevent build errors
export async function fetchAllTasks(): Promise<Task[]> {
  return [];
}

export async function addTaskAPI(payload: any): Promise<Task | null> {
  return null;
}

export async function updateTaskAPI(taskid: number, payload: any): Promise<Task | null> {
  return null;
}

export async function deleteTaskAPI(taskid: number): Promise<boolean> {
  return false;
}

export async function fetchSavedTasks(): Promise<SavedTask[]> {
  return [];
}

export async function addSavedTaskAPI(task: any): Promise<any> {
  return null;
}

export async function updateSavedTaskAPI(id: number, task: any): Promise<any> {
  return null;
}

export async function deleteSavedTaskAPI(id: number, taskidbyfrontend: number): Promise<boolean> {
  return false;
}

export async function retryUntilSuccess<T>(fn: () => Promise<T>, delay = 2000): Promise<T> {
  throw new Error("Feature disabled for deployment");
}

/*
Original implementation commented out to prevent build errors:

import { getSessionCookie } from "@/utils/getCookie";

const FAST_URL = process.env.FAST_URL || '';

interface BackendSavedTask {
  id: number;
  name: string;
  estimated_time: number;
  username: string;
}

interface SavedTaskInput {
  username: string;
  name: string;
  estimated_time: number;
}

interface DeletedTaskInfo {
  id: number;
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

// ... rest of original implementation ...
*/
