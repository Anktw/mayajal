'use client'

import React from 'react';
import { Button } from "@/components/ui/button"
import { formatTime } from '../utils/timeUtils';
import { Trash2 } from 'lucide-react';

interface CompletedTask {
  id: number;
  name: string;
  estimatedTime: number;
  completionTime: string;
}

interface CompletedTaskListProps {
  tasks: CompletedTask[];
  onDeleteTask: (taskId: number) => void;
}

export function CompletedTaskList({ tasks, onDeleteTask }: CompletedTaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between p-4 bg-gray-100 shadow rounded-lg">
          <div>
            <h3 className="font-bold">{task.name}</h3>
            <p>Estimated time: {formatTime(task.estimatedTime)}</p>
            <p>Completed at: {new Date(task.completionTime).toLocaleString()}</p>
          </div>
          <Button variant="destructive" size="icon" onClick={() => onDeleteTask(task.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

