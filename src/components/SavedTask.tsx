"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Trash2, Edit2, Check, X } from "lucide-react"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { fetchSavedTasks, addSavedTaskAPI, updateSavedTaskAPI, SavedTask as BackendSavedTask } from "@/services/taskService"

interface SavedTask {
  id: number
  name: string
  estimatedTime: number
}

interface SavedTaskManagerProps {
  onAddSavedTask: (task: Omit<SavedTask, "id">) => void
  isLoggedIn?: boolean
}

export function SavedTaskManager({ onAddSavedTask, isLoggedIn }: SavedTaskManagerProps) {
  const [savedTasks, setSavedTasks] = isLoggedIn
    ? useState<SavedTask[]>([])
    : useLocalStorage<SavedTask[]>("savedTasks", [
        { id: 1, name: "Quick coding session", estimatedTime: 25 },
        { id: 2, name: "Break", estimatedTime: 10 },
      ])
  const [nextSavedId, setNextSavedId] = isLoggedIn
    ? useState(1000)
    : useLocalStorage("nextSavedId", 4)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskTime, setNewTaskTime] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editTaskName, setEditTaskName] = useState("")
  const [editTaskTime, setEditTaskTime] = useState("")

  // Fetch saved tasks from backend if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedTasks().then(setSavedTasks)
    }
  }, [isLoggedIn])

  const handleAddSavedTask = async () => {
    if (newTaskName && newTaskTime) {
      if (isLoggedIn) {
        const newTask = await addSavedTaskAPI(newTaskName, Number.parseInt(newTaskTime))
        if (newTask) setSavedTasks([...savedTasks, newTask])
      } else {
        const newTask: SavedTask = {
          id: nextSavedId,
          name: newTaskName,
          estimatedTime: Number.parseInt(newTaskTime),
        }
        setSavedTasks([...savedTasks, newTask])
        setNextSavedId(nextSavedId + 1)
      }
      setNewTaskName("")
      setNewTaskTime("")
      setIsAdding(false)
    }
  }

  const handleDeleteSavedTask = (id: number) => {
    setSavedTasks(savedTasks.filter((task) => task.id !== id))
  }

  const handleEditClick = (task: SavedTask) => {
    setEditingTaskId(task.id)
    setEditTaskName(task.name)
    setEditTaskTime(task.estimatedTime.toString())
  }

  const handleEditSave = async () => {
    if (editingTaskId && editTaskName && editTaskTime) {
      if (isLoggedIn) {
        const updated = await updateSavedTaskAPI(editingTaskId, {
          name: editTaskName,
          estimated_time: Number.parseInt(editTaskTime),
        })
        if (updated) setSavedTasks(savedTasks.map((task) => (task.id === editingTaskId ? updated : task)))
      } else {
        setSavedTasks(
          savedTasks.map((task) =>
            task.id === editingTaskId
              ? { ...task, name: editTaskName, estimatedTime: Number.parseInt(editTaskTime) }
              : task,
          ),
        )
      }
      setEditingTaskId(null)
      setEditTaskName("")
      setEditTaskTime("")
    }
  }

  const handleEditCancel = () => {
    setEditingTaskId(null)
    setEditTaskName("")
    setEditTaskTime("")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {savedTasks.map((task) => (
          <div key={task.id} className="flex items-center mb-2">
            {editingTaskId === task.id ? (
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                <Input
                  type="text"
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                  placeholder="Task name"
                  className="w-40"
                />
                <Input
                  type="number"
                  value={editTaskTime}
                  onChange={(e) => setEditTaskTime(e.target.value)}
                  placeholder="Minutes"
                  className="w-24"
                />
                <Button size="icon" onClick={handleEditSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleEditCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    onAddSavedTask({
                      name: task.name,
                      estimatedTime: task.estimatedTime,
                    })
                  }
                  className="flex items-center gap-2"
                >
                  {task.name} ({task.estimatedTime}m)
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleEditClick(task)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSavedTask(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Task name"
            className="w-40"
          />
          <Input
            type="number"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            placeholder="Minutes"
            className="w-24"
          />
          <Button onClick={handleAddSavedTask}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Saved Task
        </Button>
      )}
    </div>
  )
}
