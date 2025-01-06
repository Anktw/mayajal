import React from 'react';
import { formatTime } from '@/utils/timeUtils';

interface CompletedTask {
  id: number;
  name: string;
  estimatedTime: number;
  completionTime: Date;
}

interface CompletedTaskListProps {
  tasks: CompletedTask[];
}

export function CompletedTaskList({ tasks }: CompletedTaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="p-4 bg-gray-100 shadow rounded-lg">
          <h3 className="font-bold">{task.name}</h3>
          <p>Estimated time: {formatTime(task.estimatedTime)}</p>
          <p>Completed at: {task.completionTime.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

