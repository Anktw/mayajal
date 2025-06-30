"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Trash2, Edit2, Check, X } from "lucide-react"
import { useLocalStorage } from "../../hooks/useLocalStorage"
import { fetchSavedTasks, addSavedTaskAPI, updateSavedTaskAPI, deleteSavedTaskAPI, retryUntilSuccess, SavedTask as BackendSavedTask } from "@/services/taskService"

interface SavedTask {
  id: number
  name: string
  estimatedTime: number
}

interface SavedTaskManagerProps {
  onAddSavedTask: (task: Omit<SavedTask, "id">) => void
  username: string
}

export function SavedTaskManager({ onAddSavedTask, username }: SavedTaskManagerProps) {
  const [savedTasks, setSavedTasks] = useLocalStorage<SavedTask[]>("savedTasks", [])
  const [nextFrontendId, setNextFrontendId] = useLocalStorage("nextSavedTaskFrontendId", 1)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskTime, setNewTaskTime] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editTaskName, setEditTaskName] = useState("")
  const [editTaskTime, setEditTaskTime] = useState("")
  const [deletedTasks, setDeletedTasks] = useLocalStorage<number[]>("deletedTaskIds", [])

  // Sync deleted tasks with backend when online
  const syncDeletedTasks = async () => {
    if (deletedTasks.length === 0) return;

    const failedDeletes: number[] = [];
    
    for (const id of deletedTasks) {
      try {
        await retryUntilSuccess(() => deleteSavedTaskAPI(id));
      } catch (error) {
        failedDeletes.push(id);
      }
    }

    setDeletedTasks(failedDeletes);
  };

  // Initial sync and online status handling
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const backendTasks = await fetchSavedTasks();
        
        // Filter out any tasks that are pending deletion
        const filteredBackendTasks = backendTasks.filter(task => !deletedTasks.includes(task.id));

        // Create maps for easy lookup
        const backendTaskMap = new Map(
          filteredBackendTasks.map(task => [task.taskidbyfrontend, task])
        );
        
        const localTaskMap = new Map(
          savedTasks.map(task => [task.taskidbyfrontend, task])
        );

        const syncedTasks: SavedTask[] = [];

        // Add all local tasks first
        savedTasks.forEach(localTask => {
          const backendTask = backendTaskMap.get(localTask.taskidbyfrontend as any);
          if (backendTask) {
            // Task exists in both - use backend data but keep frontend ID
            syncedTasks.push({
              id: backendTask.id,
              taskidbyfrontend: localTask.taskidbyfrontend,
              name: backendTask.name,
              estimatedTime: backendTask.estimated_time
            });
          } else {
            // Task only exists locally - sync to backend
            syncedTasks.push(localTask);
            addSavedTaskAPI({
              username,
              name: localTask.name,
              estimated_time: localTask.estimatedTime,
              taskidbyfrontend: localTask.taskidbyfrontend
            });
          }
        });

        // Add backend tasks that don't exist locally
        filteredBackendTasks.forEach(backendTask => {
          if (!localTaskMap.has(Number(backendTask.taskidbyfrontend))) {
            syncedTasks.push({
              id: backendTask.id,
              taskidbyfrontend: Number(backendTask.taskidbyfrontend),
              name: backendTask.name,
              estimatedTime: backendTask.estimated_time
            });
          }
        });

        setSavedTasks(syncedTasks);
      } catch (error) {
        console.error("Error syncing with backend:", error);
      }
    };

    syncWithBackend();
    syncDeletedTasks();
  }, [username]);

  // Handle online status changes
  useEffect(() => {
    const handleOnline = () => {
      syncDeletedTasks();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleAddSavedTask = async () => {
    if (newTaskName && newTaskTime) {
      const newTaskFrontendId = nextFrontendId;
      const newTask: SavedTask = {
        id: -1,
        taskidbyfrontend: newTaskFrontendId,
        name: newTaskName,
        estimatedTime: Number.parseInt(newTaskTime),
      };

      // Save to local storage first
      setSavedTasks([...savedTasks, newTask]);
      setNextFrontendId(nextFrontendId + 1);

      // Try to sync with backend
      try {
        const backendTask = await retryUntilSuccess(() =>
          addSavedTaskAPI({
            username,
            name: newTaskName,
            estimated_time: Number.parseInt(newTaskTime),
            taskidbyfrontend: newTaskFrontendId,
          })
        );

        if (backendTask) {
          setSavedTasks(
            savedTasks.map((task) =>
              task.taskidbyfrontend === newTaskFrontendId
                ? { ...task, id: backendTask.id }
                : task,
            ),
          );
        }
      } catch (error) {
        console.error("Error adding task to backend:", error);
      }

      setNewTaskName("");
      setNewTaskTime("");
      setIsAdding(false);
    }
  }

  const handleDeleteSavedTask = (id: number, taskidbyfrontend: number) => {
    // Remove from local storage first
    setSavedTasks(savedTasks.filter((task) => task.taskidbyfrontend !== taskidbyfrontend));

    // If task has a backend ID, try to delete from backend
    if (id > 0) {
      try {
        retryUntilSuccess(() => deleteSavedTaskAPI(id));
      } catch (error) {
        // If offline or deletion fails, store ID for later deletion
        setDeletedTasks([...deletedTasks, id]);
      }
    }
  };

  const handleEditClick = (task: SavedTask) => {
    setEditingTaskId(task.id)
    setEditTaskName(task.name)
    setEditTaskTime(task.estimatedTime.toString())
  }

  const handleEditSave = async () => {
    if (editingTaskId && editTaskName && editTaskTime) {
      const taskToEdit = savedTasks.find(task => task.id === editingTaskId);
      
      if (taskToEdit) {
        try {
          const updated = await retryUntilSuccess(() =>
            updateSavedTaskAPI(editingTaskId, {
              username,
              name: editTaskName,
              estimated_time: Number.parseInt(editTaskTime),
              taskidbyfrontend: taskToEdit.taskidbyfrontend
            })
          );

          if (updated) {
            setSavedTasks(
              savedTasks.map((task) =>
                task.id === editingTaskId
                  ? { 
                      id: updated.id, 
                      taskidbyfrontend: taskToEdit.taskidbyfrontend,
                      name: updated.name, 
                      estimatedTime: updated.estimated_time 
                    }
                  : task,
              ),
            );
          }
        } catch (error) {
          console.error("Error updating task in backend:", error);
        }
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
          <div key={task.taskidbyfrontend} className="flex items-center mb-2">
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteSavedTask(task.id, task.taskidbyfrontend)}
                >
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