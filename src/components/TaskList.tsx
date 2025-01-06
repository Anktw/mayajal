import React from 'react';
import { Button } from "@/components/ui/button"
import { formatTime } from '../utils/timeUtils';
import { Timer } from './Timer';

interface Task {
  id: number;
  name: string;
  estimatedTime: number;
  startTime: Date;
  completionTime: Date;
}

interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (taskId: number) => void;
  onAdjustFirstTask: (adjustment: number) => void;
}

export function TaskList({ tasks, onCompleteTask, onAdjustFirstTask }: TaskListProps) {
  const handleAdjustment = (minutes: number) => {
    onAdjustFirstTask(minutes);
  };

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div key={task.id} className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
          <div>
            <h3 className="font-bold">{task.name}</h3>
            <p>Estimated time: {formatTime(task.estimatedTime)}</p>
            <p>Completion time: {task.completionTime ? task.completionTime.toLocaleString() : 'Not set'}</p>
            {index === 0 && task.completionTime && <Timer endTime={task.completionTime} />}
          </div>
          {index === 0 && (
            <div className="space-x-2">
              <Button onClick={() => handleAdjustment(-15)}>-15m</Button>
              <Button onClick={() => handleAdjustment(15)}>+15m</Button>
            </div>
          )}
          <Button onClick={() => onCompleteTask(task.id)}>Complete</Button>
        </div>
      ))}
    </div>
  );
}

