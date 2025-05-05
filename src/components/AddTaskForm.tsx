import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddTaskFormProps {
  onAddTask: (taskName: string, estimatedTime: number) => void;
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [taskName, setTaskName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('')
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'hours' | 'days'>('minutes')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !estimatedTime) return;
    let timeInMinutes = parseInt(estimatedTime)
    if (timeUnit === 'hours') timeInMinutes *= 60
    if (timeUnit === 'days') timeInMinutes *= 1440
    if (taskName && estimatedTime) {
      onAddTask(taskName, timeInMinutes);
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
      /><div className="flex gap-2">
        <Input
          type="number"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
          placeholder="Estimated time"
          required
          min="1"
        />
        <Select value={timeUnit} onValueChange={(val) => setTimeUnit(val as 'minutes' | 'hours' | 'days')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Add Task</Button>
    </form>
  );
}