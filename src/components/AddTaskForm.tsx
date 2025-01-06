import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddTaskFormProps {
  onAddTask: (taskName: string, estimatedTime: number) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [taskName, setTaskName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName && estimatedTime) {
      onAddTask(taskName, parseInt(estimatedTime));
      setTaskName('');
      setEstimatedTime('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Task name"
        required
      />
      <Input
        type="number"
        value={estimatedTime}
        onChange={(e) => setEstimatedTime(e.target.value)}
        placeholder="Estimated time (minutes)"
        required
        min="1"
      />
      <Button type="submit">Add Task</Button>
    </form>
  );
}

