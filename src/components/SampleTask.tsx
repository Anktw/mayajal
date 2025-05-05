"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Trash2 } from "lucide-react"
import { useLocalStorage } from "../hooks/useLocalStorage"

interface SampleTask {
  id: number
  name: string
  estimatedTime: number
  isBreak: boolean
}

interface SampleTaskManagerProps {
  onAddSampleTask: (task: Omit<SampleTask, "id">) => void
}

export function SampleTaskManager({ onAddSampleTask }: SampleTaskManagerProps) {
  const [sampleTasks, setSampleTasks] = useLocalStorage<SampleTask[]>("sampleTasks", [
    { id: 1, name: "Quick coding session", estimatedTime: 25, isBreak: false },
    { id: 2, name: "Coffee break", estimatedTime: 15, isBreak: true },
    { id: 3, name: "Email check", estimatedTime: 10, isBreak: false },
  ])
  const [nextSampleId, setNextSampleId] = useLocalStorage("nextSampleId", 4)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskTime, setNewTaskTime] = useState("")
  const [isBreak, setIsBreak] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddSampleTask = () => {
    if (newTaskName && newTaskTime) {
      const newTask: SampleTask = {
        id: nextSampleId,
        name: newTaskName,
        estimatedTime: Number.parseInt(newTaskTime),
        isBreak,
      }
      setSampleTasks([...sampleTasks, newTask])
      setNextSampleId(nextSampleId + 1)
      setNewTaskName("")
      setNewTaskTime("")
      setIsBreak(false)
      setIsAdding(false)
    }
  }

  const handleDeleteSampleTask = (id: number) => {
    setSampleTasks(sampleTasks.filter((task) => task.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {sampleTasks.map((task) => (
          <div key={task.id} className="flex items-center">
            <Button
              variant={task.isBreak ? "secondary" : "outline"}
              onClick={() =>
                onAddSampleTask({
                  name: task.name,
                  estimatedTime: task.estimatedTime,
                  isBreak: task.isBreak,
                })
              }
              className="flex items-center gap-2"
            >
              {task.name} ({task.estimatedTime}m)
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteSampleTask(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isBreak" checked={isBreak} onChange={(e) => setIsBreak(e.target.checked)} />
            <label htmlFor="isBreak">Break</label>
          </div>
          <Button onClick={handleAddSampleTask}>
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
          Add Sample Task
        </Button>
      )}
    </div>
  )
}