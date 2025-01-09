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
        <div key={task.id} className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
          <div className="flex-grow">
            <h3 className="font-bold">{task.name}</h3>
            <p>Estimated time: {formatTime(task.estimatedTime)}</p>
            <p>Completion time: {new Date(task.completionTime).toLocaleString()}</p>
            {index === 0 && <Timer endTime={new Date(task.completionTime)} />}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col space-y-1">
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMoveTask(task.id, 'up')} 
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => onMoveTask(task.id, 'down')} 
                disabled={index === tasks.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            {editingTaskId === task.id ? (
              <div className="flex items-center space-x-2">
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
              <Button size="icon" variant="outline" onClick={() => handleEditClick(task)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {index === 0 && (
              <>
                <Button onClick={() => handleAdjustment(-15)}>-15m</Button>
                <Button onClick={() => handleAdjustment(15)}>+15m</Button>
              </>
            )}
            <Button onClick={() => onCompleteTask(task.id)}>Complete</Button>
            <Button variant="destructive" size="icon" onClick={() => onDeleteTask(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

