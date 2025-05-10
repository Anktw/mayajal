"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Trash2, Edit2, Check, X } from "lucide-react"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { fetchSavedTasks, addSavedTaskAPI, updateSavedTaskAPI, deleteSavedTaskAPI, retryUntilSuccess, SavedTask as BackendSavedTask } from "@/services/taskService"

interface SavedTask {
  id: number
  taskidbyfrontend: number
  name: string
  estimatedTime: number
}

interface SavedTaskManagerProps {
  onAddSavedTask: (task: Omit<SavedTask, "id" | "taskidbyfrontend">) => void
  isLoggedIn?: boolean
}

export function SavedTaskManager({ onAddSavedTask, isLoggedIn }: SavedTaskManagerProps) {
  const [savedTasks, setSavedTasks] = useLocalStorage<SavedTask[]>("savedTasks", [
    { id: 1, taskidbyfrontend: 1, name: "Quick coding session", estimatedTime: 25 },
    { id: 2, taskidbyfrontend: 2, name: "Break", estimatedTime: 10 },
  ])
  const [nextFrontendId, setNextFrontendId] = useLocalStorage("nextSavedTaskFrontendId", 3)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskTime, setNewTaskTime] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editTaskName, setEditTaskName] = useState("")
  const [editTaskTime, setEditTaskTime] = useState("")
  const [username, setUsername] = useState<string | null>(null)
  const [deletedTasks, setDeletedTasks] = useLocalStorage<number[]>("deletedTaskIds", [])

  // Add this new function
  const syncDeletedTasks = async () => {
    if (!isLoggedIn || !username || deletedTasks.length === 0) return;

    // Try to delete each stored ID
    const failedDeletes: number[] = [];
    
    for (const id of deletedTasks) {
      try {
        await retryUntilSuccess(() => deleteSavedTaskAPI(id));
      } catch (error) {
        failedDeletes.push(id);
      }
    }

    // Update deleted tasks list with only the failed ones
    setDeletedTasks(failedDeletes);
  };

  // Fetch saved tasks from backend if logged in
  useEffect(() => {
    if (isLoggedIn) {
      // Sync deletions first
      syncDeletedTasks();

      fetchSavedTasks().then((backendTasks) => {
        // Filter out any tasks that are pending deletion
        backendTasks = backendTasks.filter(task => !deletedTasks.includes(task.id));

        // Create maps for easy lookup
        const backendTaskMap = new Map(
          backendTasks.map(task => [task.taskidbyfrontend, task])
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
            if (username) {
              addSavedTaskAPI({
                username,
                name: localTask.name,
                estimated_time: localTask.estimatedTime,
                taskidbyfrontend: localTask.taskidbyfrontend
              });
            }
          }
        });

        // Add backend tasks that don't exist locally
        backendTasks.forEach(backendTask => {
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
      });

      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.username) setUsername(data.username)
        })
    }
  }, [isLoggedIn, username, deletedTasks]) // Add deletedTasks to dependencies

  useEffect(() => {
    const handleOnline = () => {
      if (isLoggedIn) {
        syncDeletedTasks();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isLoggedIn]);

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

      // Sync with backend if logged in
      if (isLoggedIn && username) {
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
          // Optionally, display an error message to the user
        }
      }

      setNewTaskName("");
      setNewTaskTime("");
      setIsAdding(false);
    }
  }

  const handleDeleteSavedTask = (id: number, taskidbyfrontend: number) => {
    // Remove from local storage first
    setSavedTasks(savedTasks.filter((task) => task.taskidbyfrontend !== taskidbyfrontend));

    // If logged in, sync with backend immediately
    if (isLoggedIn && username) {
      retryUntilSuccess(() => deleteSavedTaskAPI(id));
    } else if (id > 0) { // Only track if it was a synced task (has real backend id)
      // Store the ID to delete later when back online
      setDeletedTasks([...deletedTasks, id]);
    }
  };

  const handleEditClick = (task: SavedTask) => {
    setEditingTaskId(task.id)
    setEditTaskName(task.name)
    setEditTaskTime(task.estimatedTime.toString())
  }

  const handleEditSave = async () => {
    if (editingTaskId && editTaskName && editTaskTime) {
      // Find the task being edited to get its taskidbyfrontend
      const taskToEdit = savedTasks.find(task => task.id === editingTaskId);
      
      if (isLoggedIn && username && taskToEdit) {
        const updated = await retryUntilSuccess(() =>
          updateSavedTaskAPI(editingTaskId, {
            username,
            name: editTaskName,
            estimated_time: Number.parseInt(editTaskTime),
            taskidbyfrontend: taskToEdit.taskidbyfrontend // Use the existing taskidbyfrontend
          }),
        )
        if (updated)
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
          )
      } else if (!isLoggedIn) {
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
