'use client'

import React from 'react';
import { Button } from "@/components/ui/button"
import { formatTime } from '../utils/timeUtils';
import { Timer } from './Timer';
import { Trash2 } from 'lucide-react';

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
}

export function TaskList({ tasks, onCompleteTask, onAdjustFirstTask, onDeleteTask }: TaskListProps) {
  const handleAdjustment = (minutes: number) => {
    onAdjustFirstTask(minutes);
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
