"use client"

import { useEffect, useState } from "react"
import { AddTaskForm } from "../AddTaskForm"
import { TaskList } from "../TaskList"
import { CompletedTaskList } from "../CompletedTaskList"
import { SavedTaskManager } from "./SavedTask"
import { fetchAllTasks, addTaskAPI, updateTaskAPI, deleteTaskAPI, retryUntilSuccess } from "@/services/taskService"
import { addMinutesToDate } from "@/utils/timeUtils"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface Task {
  id: number
  taskidbyfrontend: number
  name: string
  estimatedTime: number
  startTime: string
  completionTime: string
  needsSync?: boolean
}

export function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [completedTasks, setCompletedTasks] = useLocalStorage<Task[]>("completedTasks", [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextId, setNextId] = useLocalStorage("nextId", 1)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncError, setLastSyncError] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [usernameFetched, setUsernameFetched] = useState(false)

  // Fetch username only once on mount
  useEffect(() => {
    if (!usernameFetched) {
      fetch("/api/user/me")
        .then(res => res.json())
        .then(data => {
          if (data && data.username) setUsername(data.username)
          setUsernameFetched(true)
        })
    }
  }, [usernameFetched])

  const addTask = (taskName: string, estimatedTime: number) => {
    if (!username) return // Don't add if username not loaded
    const now = new Date()
    const newTask: Task = {
      id: nextId,
      taskidbyfrontend: nextId,
      name: taskName,
      estimatedTime,
      startTime: now.toISOString(),
      completionTime: addMinutesToDate(now, estimatedTime).toISOString(),
      needsSync: true,
    }
    setTasks([...tasks, newTask]) // Save to local storage immediately
    setNextId(nextId + 1)
    updateTaskTimes([...tasks, newTask])
    // Do NOT call addTaskAPI here; syncTasksWithBackend will handle backend sync
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
    // Remove from UI immediately
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    updateTaskTimes(updatedTasks)
    // If logged in, sync delete to backend with infinite retry
    if (username) {
      retryUntilSuccess(() => deleteTaskAPI(taskId))
    }
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
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, estimatedTime: newEstimatedTime, needsSync: true } : task
    )
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

  const addSavedTask = ({ name, estimatedTime }: { name: string; estimatedTime: number }) => {
    addTask(name, estimatedTime)
  }

  // Determine sync status
  const unsyncedTasks = tasks.some(t => t.needsSync)
  let syncStatus: 'synced' | 'syncing' | 'error' = 'synced'
  if (syncing) syncStatus = 'syncing'
  else if (lastSyncError || unsyncedTasks) syncStatus = 'error'

  useEffect(() => {
    const syncInterval = setInterval(() => {
      syncTasksWithBackend()
    }, 5000)
    window.addEventListener('online', syncTasksWithBackend)
    return () => {
      clearInterval(syncInterval)
      window.removeEventListener('online', syncTasksWithBackend)
    }
  }, [tasks, completedTasks])

  const syncTasksWithBackend = async () => {
    if (!username) return
    const dirtyTasks = tasks.filter(t => t.needsSync)
    if (dirtyTasks.length === 0) {
      setSyncing(false)
      setLastSyncError(null)
      return
    }
    setSyncing(true)
    setLastSyncError(null)
    try {
      let allSuccess = true
      for (const task of dirtyTasks) {
        const payload = {
          username,
          name: task.name,
          estimated_time: task.estimatedTime,
          completion_time: task.completionTime,
          completed: false,
          taskidbyfrontend: task.taskidbyfrontend,
        }
        let ok = false
        if (task.id < 1000000) {
          const res = await retryUntilSuccess(() => addTaskAPI(payload))
          ok = !!res
        } else {
          const res = await retryUntilSuccess(() => updateTaskAPI(task.id, payload))
          ok = !!res
        }
        if (!ok) allSuccess = false
      }
      if (allSuccess) {
        setTasks(tasks.map(t => ({ ...t, needsSync: false })))
        setSyncing(false)
        setLastSyncError(null)
      } else {
        setLastSyncError("Failed to sync some tasks with backend")
        setSyncing(false)
      }
    } catch (err) {
      setLastSyncError("Failed to sync tasks with backend")
      setSyncing(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <p className={
        syncStatus === 'synced'
          ? 'text-green-600 font-semibold mt-10'
          : syncStatus === 'syncing'
          ? 'text-yellow-600 font-semibold mt-10'
          : 'text-red-600 font-semibold mt-10'
      }>
        {syncStatus === 'synced' && 'Synced with backend'}
        {syncStatus === 'syncing' && 'Syncing with backend...'}
        {syncStatus === 'error' && (lastSyncError ? lastSyncError : 'Not all tasks are synced!')}
      </p>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Add Task</h2>
        <AddTaskForm onAddTask={addTask} />
        <SavedTaskManager onAddSavedTask={addSavedTask} isLoggedIn={true} />
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
      {error && <span className="text-xs text-red-500">{error}</span>}
      {isLoading && <span className="text-xs text-gray-500">Loading...</span>}
    </div>
  )
}