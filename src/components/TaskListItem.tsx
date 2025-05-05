import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/timeUtils';
import { Timer } from './Timer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronUp, ChevronDown, Edit2, Check } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  estimatedTime: number;
  startTime: string;
  completionTime: string;
}

interface TaskListItemProps {
  task: Task;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  editingTaskId: number | null;
  editedTime: string;
  setEditingTaskId: (id: number | null) => void;
  setEditedTime: (val: string) => void;
  onEditClick: (task: Task) => void;
  onEditSubmit: (taskId: number) => void;
  onMoveTask: (taskId: number, direction: 'up' | 'down') => void;
  onCompleteTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onAdjustment?: (minutes: number) => void;
}

export function TaskListItem({
  task,
  index,
  isFirst,
  isLast,
  editingTaskId,
  editedTime,
  setEditingTaskId,
  setEditedTime,
  onEditClick,
  onEditSubmit,
  onMoveTask,
  onCompleteTask,
  onDeleteTask,
  onAdjustment
}: TaskListItemProps) {
  const [formattedCompletion, setFormattedCompletion] = useState('');
  useEffect(() => {
    setFormattedCompletion(new Date(task.completionTime).toLocaleString());
  }, [task.completionTime]);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between justify-between bg-foreground dark:bg-black text-background dark:text-foreground p-4 shadow rounded-lg gap-4">
      <div className="flex-grow mb-2 md:mb-0">
        <h3 className="font-bold break-words text-xl">{task.name}</h3>
        <p className="text-sm">Estimated time: {formatTime(task.estimatedTime)}</p>
        <p className="text-xs">Completion time: {formattedCompletion}</p>
        {isFirst && <Timer endTime={new Date(task.completionTime)} />}
      </div>
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
        <div className="flex flex-row md:flex-col gap-1">
          <Button 
            size="icon" 
            variant="default" 
            onClick={() => onMoveTask(task.id, 'up')} 
            disabled={isFirst}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="default" 
            onClick={() => onMoveTask(task.id, 'down')} 
            disabled={isLast}
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
            <Button size="icon" onClick={() => onEditSubmit(task.id)}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button size="icon" variant="default" onClick={() => onEditClick(task)}>
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        {isFirst && onAdjustment && (
          <>
            <Button className="px-2 py-1 text-xs" onClick={() => onAdjustment(-15)}>-15m</Button>
            <Button className="px-2 py-1 text-xs" onClick={() => onAdjustment(15)}>+15m</Button>
          </>
        )}
        <Button className="px-2 py-1 text-xs " onClick={() => onCompleteTask(task.id)}>Completed</Button>
        <Button variant="destructive" size="icon" onClick={() => onDeleteTask(task.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
