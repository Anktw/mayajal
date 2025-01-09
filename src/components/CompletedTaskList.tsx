import React from 'react';
import { formatTime } from '../utils/timeUtils';
import { format } from 'date-fns';

interface CompletedTask {
  id: number;
  name: string;
  estimatedTime: number;
  completionTime: string;
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
          <p>Completed at: {format(new Date(task.completionTime), 'Pp')}</p>
        </div>
      ))}
    </div>
  );
}
