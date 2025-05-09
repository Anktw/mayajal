"use client"

import { useEffect, useState } from "react"
import { AddTaskForm } from "../AddTaskForm"
import { TaskList } from "../TaskList"
import { CompletedTaskList } from "../CompletedTaskList"
import { SavedTaskManager } from "../SavedTask"
import { fetchAllTasks, addTaskAPI, updateTaskAPI } from "@/services/taskService"
import { addMinutesToDate } from "@/utils/timeUtils"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface Task {
  id: number
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

  const addTask = (taskName: string, estimatedTime: number) => {
    const now = new Date()
    const newTask: Task = {
      id: nextId,
      name: taskName,
      estimatedTime,
      startTime: now.toISOString(),
      completionTime: addMinutesToDate(now, estimatedTime).toISOString(),
      needsSync: true,
    }
    setTasks([...tasks, newTask])
    setNextId(nextId + 1)
    updateTaskTimes([...tasks, newTask])
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
    const dirtyTasks = tasks.filter(t => t.needsSync)
    if (dirtyTasks.length === 0) return
    setIsLoading(true)
    try {
      for (const task of dirtyTasks) {
        if (task.id < 1000000) {
          await addTaskAPI(task.name, task.estimatedTime)
        } else {
          await updateTaskAPI(task.id, { name: task.name, estimated_time: task.estimatedTime })
        }
      }
      setTasks(tasks.map(t => ({ ...t, needsSync: false })))
    } catch (err) {
      setError("Failed to sync tasks with backend")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <p className="text-green-600 font-semibold mt-10">Synced with backend</p>
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