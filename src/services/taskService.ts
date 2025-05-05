const API_BASE_URL = process.env.FAST_URL || ''

interface Task {
  id: number
  name: string
  estimatedTime: number
  startTime: string
  completionTime: string
}

// Function to sync tasks with backend
export async function syncTasksWithBackend(tasks: Task[], completedTasks: Task[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/lockin/syncuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks,
        completedTasks,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to sync tasks with backend")
    }

    return true
  } catch (error) {
    console.error("Error syncing tasks with backend:", error)
    return false
  }
}

// Function to fetch tasks from backend
export async function fetchTasksFromBackend(): Promise<{ tasks: Task[]; completedTasks: Task[] } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/lockin/getuser`)

    if (!response.ok) {
      throw new Error("Failed to fetch tasks from backend")
    }

    const data = await response.json()
    return {
      tasks: data.tasks || [],
      completedTasks: data.completedTasks || [],
    }
  } catch (error) {
    console.error("Error fetching tasks from backend:", error)
    return null
  }
}
