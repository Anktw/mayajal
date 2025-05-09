"use client"

import { useEffect, useState } from "react"
import { AddTaskForm } from "../AddTaskForm"
import { TaskList } from "../TaskList"
import { CompletedTaskList } from "../CompletedTaskList"
import { SavedTaskManager } from "../SavedTask"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { addMinutesToDate } from "@/utils/timeUtils"
import { syncTasksWithBackend, fetchTasksFromBackend } from "@/services/taskService"
import { Button } from "@/components/ui/button"
import { Loader2, Save, RefreshCw } from "lucide-react"

interface Task {
  id: number
  name: string
  estimatedTime: number
  startTime: string
  completionTime: string
}

export function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [completedTasks, setCompletedTasks] = useLocalStorage<Task[]>("completedTasks", [])
  const [nextId, setNextId] = useLocalStorage("nextId", 1)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    // Convert stored dates to ISO strings
    setTasks(
      tasks.map((task) => ({
        ...task,
        startTime: new Date(task.startTime).toISOString(),
        completionTime: task.completionTime ? new Date(task.completionTime).toISOString() : new Date().toISOString(),
      })),
    )
    setCompletedTasks(
      completedTasks.map((task) => ({
        ...task,
        completionTime: new Date(task.completionTime).toISOString(),
      })),
    )

    // Fetch tasks from backend on initial load
    loadTasksFromBackend()
  }, [])

  // Sync tasks with backend whenever they change
  useEffect(() => {
    const debounceSync = setTimeout(() => {
      if (tasks.length > 0 || completedTasks.length > 0) {
        syncWithBackend()
      }
    }, 5000) // Debounce sync to avoid too many requests

    return () => clearTimeout(debounceSync)
  }, [tasks, completedTasks])

  const loadTasksFromBackend = async () => {
    setIsLoading(true)
    setSyncError(null)

    try {
      const backendData = await fetchTasksFromBackend()

      if (backendData) {
        // Only update if there's data and local storage is empty
        if (backendData.tasks.length > 0 && tasks.length === 0) {
          setTasks(backendData.tasks)
        }

        if (backendData.completedTasks.length > 0 && completedTasks.length === 0) {
          setCompletedTasks(backendData.completedTasks)
        }

        // Update nextId to be greater than any existing id
        const allIds = [...backendData.tasks.map((t: { id: any }) => t.id), ...backendData.completedTasks.map((t: { id: any }) => t.id)]

        if (allIds.length > 0) {
          const maxId = Math.max(...allIds)
          setNextId(Math.max(maxId + 1, nextId))
        }

        setLastSynced(new Date())
      }
    } catch (error) {
      console.error("Error loading from backend:", error)
      setSyncError("Failed to load tasks from server")
    } finally {
      setIsLoading(false)
    }
  }

  const syncWithBackend = async () => {
    setIsSyncing(true)
    setSyncError(null)

    try {
      const success = await syncTasksWithBackend(tasks, completedTasks)

      if (success) {
        setLastSynced(new Date())
      } else {
        setSyncError("Sync failed")
      }
    } catch (error) {
      console.error("Error syncing with backend:", error)
      setSyncError("Failed to sync with server")
    } finally {
      setIsSyncing(false)
    }
  }

  const addTask = (taskName: string, estimatedTime: number) => {
    const now = new Date()
    const newTask: Task = {
      id: nextId,
      name: taskName,
      estimatedTime,
      startTime: now.toISOString(),
      completionTime: addMinutesToDate(now, estimatedTime).toISOString(),
    }
    setTasks([...tasks, newTask])
    setNextId(nextId + 1)
    updateTaskTimes([...tasks, newTask])
  }

  const addSavedTask = ({ name, estimatedTime }: { name: string; estimatedTime: number }) => {
    addTask(name, estimatedTime)
  }

  const completeTask = (taskId: number) => {
    const taskToComplete = tasks.find((task) => task.id === taskId)
    if (taskToComplete) {
      setCompletedTasks([...completedTasks, { ...taskToComplete, completionTime: new Date().toISOString() }])
      const updatedTasks = tasks.filter((task) => task.id !== taskId)
      setTasks(updatedTasks)
      updateTaskTimes(updatedTasks)
    }
  }

  const adjustFirstTask = (adjustment: number) => {
    if (tasks.length > 0) {
      const updatedTasks = [...tasks]
      updatedTasks[0].estimatedTime += adjustment
      updateTaskTimes(updatedTasks)
    }
  }

  const deleteTask = (taskId: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    updateTaskTimes(updatedTasks)
  }

  const deleteCompletedTask = (taskId: number) => {
    setCompletedTasks(completedTasks.filter((task) => task.id !== taskId))
  }

  const moveTask = (taskId: number, direction: "up" | "down") => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId)
    if (taskIndex === -1) return

    const newTasks = [...tasks]
    const task = newTasks[taskIndex]

    if (direction === "up" && taskIndex > 0) {
      newTasks[taskIndex] = newTasks[taskIndex - 1]
      newTasks[taskIndex - 1] = task
    } else if (direction === "down" && taskIndex < newTasks.length - 1) {
      newTasks[taskIndex] = newTasks[taskIndex + 1]
      newTasks[taskIndex + 1] = task
    }

    setTasks(newTasks)
    updateTaskTimes(newTasks)
  }

  const editTaskTime = (taskId: number, newEstimatedTime: number) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, estimatedTime: newEstimatedTime } : task))
    setTasks(updatedTasks)
    updateTaskTimes(updatedTasks)
  }

  const updateTaskTimes = (updatedTasks: Task[]) => {
    let currentTime = new Date()
    const newTasks = updatedTasks.map((task) => {
      const newTask = { ...task, startTime: currentTime.toISOString() }
      newTask.completionTime = addMinutesToDate(currentTime, task.estimatedTime).toISOString()
      currentTime = new Date(newTask.completionTime)
      return newTask
    })
    setTasks(newTasks)
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={syncWithBackend} disabled={isSyncing} className="flex items-center gap-2 mt-10">
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save to Server
          </Button>
          <Button
            variant="outline"
            onClick={loadTasksFromBackend}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Load from Server
          </Button>
          {lastSynced && <span className="text-xs text-gray-500">Last synced: {lastSynced.toLocaleTimeString()}</span>}
          {syncError && <span className="text-xs text-red-500">{syncError}</span>}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Add Task</h2>
        <AddTaskForm onAddTask={(name, time) => addTask(name, time)} />
        <SavedTaskManager onAddSavedTask={addSavedTask} />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Ongoing Tasks</h2>
        <TaskList
          tasks={tasks}
          onCompleteTask={completeTask}
          onAdjustFirstTask={adjustFirstTask}
          onDeleteTask={deleteTask}
          onMoveTask={moveTask}
          onEditTaskTime={editTaskTime}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Completed Tasks</h2>
        <CompletedTaskList tasks={completedTasks} onDeleteTask={deleteCompletedTask} />
      </div>
    </div>
  )
}