'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatTime } from '../utils/timeUtils';
import { Timer } from './Timer';
import { Trash2, ChevronUp, ChevronDown, Edit2, Check } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  estimatedTime: number;
  startTime: string;
  completionTime: string;
}

interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (taskId: number) => void;
  onAdjustFirstTask: (adjustment: number) => void;
  onDeleteTask: (taskId: number) => void;
  onMoveTask: (taskId: number, direction: 'up' | 'down') => void;
  onEditTaskTime: (taskId: number, newEstimatedTime: number) => void;
}

export function TaskList({ tasks, onCompleteTask, onAdjustFirstTask, onDeleteTask, onMoveTask, onEditTaskTime }: TaskListProps) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTime, setEditedTime] = useState<string>('');

  const handleAdjustment = (minutes: number) => {
    onAdjustFirstTask(minutes);
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTime(task.estimatedTime.toString());
  };

  const handleEditSubmit = (taskId: number) => {
    const newEstimatedTime = parseInt(editedTime);
    if (!isNaN(newEstimatedTime) && newEstimatedTime > 0) {
      onEditTaskTime(taskId, newEstimatedTime);
    }
    setEditingTaskId(null);
  };

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div key={task.id} className="flex flex-col md:flex-row md:items-center md:justify-between justify-between bg-foreground dark:bg-black text-background dark:text-foreground p-4 shadow rounded-lg gap-4">
          <div className="flex-grow mb-2 md:mb-0">
            <h3 className="font-bold break-words text-xl">{task.name}</h3>
            <p className="text-sm">Estimated time: {formatTime(task.estimatedTime)}</p>
            <p className="text-xs">Completion time: {new Date(task.completionTime).toLocaleString()}</p>
            {index === 0 && <Timer endTime={new Date(task.completionTime)} />}
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
            <div className="flex flex-row md:flex-col gap-1">
              <Button 
                size="icon" 
                variant="default" 
                onClick={() => onMoveTask(task.id, 'up')} 
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="default" 
                onClick={() => onMoveTask(task.id, 'down')} 
                disabled={index === tasks.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            {editingTaskId === task.id ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={editedTime}
                  onChange={(e) => setEditedTime(e.target.value)}
                  className="w-20"
                />
                <Button size="icon" onClick={() => handleEditSubmit(task.id)}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="icon" variant="default" onClick={() => handleEditClick(task)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {index === 0 && (
              <>
                <Button className="px-2 py-1 text-xs" onClick={() => handleAdjustment(-15)}>-15m</Button>
                <Button className="px-2 py-1 text-xs" onClick={() => handleAdjustment(15)}>+15m</Button>
              </>
            )}
            <Button className="px-2 py-1 text-xs " onClick={() => onCompleteTask(task.id)}>Completed</Button>
            <Button variant="destructive" size="icon" onClick={() => onDeleteTask(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

