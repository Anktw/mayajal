const FAST_URL = process.env.FAST_URL || ''

interface Task {
  id: number
  name: string
  estimatedTime: number
  startTime: string
  completionTime: string
}

// Fetch all tasks for the current user
export async function fetchAllTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`${FAST_URL}/lockin/tasks`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// Add a new task for the current user
export async function addTaskAPI(taskName: string, estimatedTime: number): Promise<Task | null> {
  try {
    const response = await fetch(`${FAST_URL}/lockin/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name: taskName, estimated_time: estimatedTime }),
    });
    if (!response.ok) {
      throw new Error('Failed to add task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
}

// Update an existing task for the current user
export async function updateTaskAPI(taskid: number, payload: Partial<{ name: string; estimated_time: number }>): Promise<Task | null> {
  try {
    const response = await fetch(`${FAST_URL}/lockin/tasks/${taskid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

// SavedTask type for backend
export interface SavedTask {
  id: number;
  name: string;
  estimatedTime: number;
}

// Fetch all saved tasks for the current user
export async function fetchSavedTasks(): Promise<SavedTask[]> {
  try {
    const response = await fetch(`${FAST_URL}/lockin/saved-tasks`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch saved tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching saved tasks:', error);
    return [];
  }
}

// Add a new saved task for the current user
export async function addSavedTaskAPI(name: string, estimatedTime: number): Promise<SavedTask | null> {
  try {
    const response = await fetch(`${FAST_URL}/lockin/saved-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, estimated_time: estimatedTime }),
    });
    if (!response.ok) {
      throw new Error('Failed to add saved task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding saved task:', error);
    return null;
  }
}

// Update an existing saved task for the current user
export async function updateSavedTaskAPI(id: number, payload: Partial<{ name: string; estimated_time: number }>): Promise<SavedTask | null> {
  try {
    const response = await fetch(`${FAST_URL}/lockin/saved-tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to update saved task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating saved task:', error);
    return null;
  }
}
