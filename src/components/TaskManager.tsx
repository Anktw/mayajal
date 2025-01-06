'use client'

import React, { useState, useEffect } from 'react';
import { AddTaskForm } from './AddTaskForm';
import { TaskList } from './TaskList';
import { CompletedTaskList } from './CompletedTaskList';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { addMinutesToDate } from '../utils/timeUtils';

interface Task {
  id: number;
  name: string;
  estimatedTime: number;
  startTime: Date;
  completionTime: Date;
}

export function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [completedTasks, setCompletedTasks] = useLocalStorage<Task[]>('completedTasks', []);
  const [nextId, setNextId] = useLocalStorage('nextId', 1);

  useEffect(() => {
    // Convert stored dates back to Date objects
    setTasks(tasks.map(task => ({
      ...task,
      startTime: new Date(task.startTime),
      completionTime: task.completionTime ? new Date(task.completionTime) : new Date()
    })));
    setCompletedTasks(completedTasks.map(task => ({
      ...task,
      completionTime: new Date(task.completionTime)
    })));
  }, []);

  const addTask = (taskName: string, estimatedTime: number) => {
    const now = new Date();
    const newTask: Task = {
      id: nextId,
      name: taskName,
      estimatedTime,
      startTime: now,
      completionTime: addMinutesToDate(now, estimatedTime)
    };
    setTasks([...tasks, newTask]);
    setNextId(nextId + 1);
    updateTaskTimes([...tasks, newTask]);
  };

  const completeTask = (taskId: number) => {
    const taskToComplete = tasks.find(task => task.id === taskId);
    if (taskToComplete) {
      setCompletedTasks([...completedTasks, { ...taskToComplete, completionTime: new Date() }]);
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      updateTaskTimes(updatedTasks);
    }
  };

  const adjustFirstTask = (adjustment: number) => {
    if (tasks.length > 0) {
      const updatedTasks = [...tasks];
      updatedTasks[0].estimatedTime += adjustment;
      updateTaskTimes(updatedTasks);
    }
  };

  const updateTaskTimes = (updatedTasks: Task[]) => {
    let currentTime = new Date();
    const newTasks = updatedTasks.map(task => {
      const newTask = { ...task, startTime: new Date(currentTime) };
      newTask.completionTime = addMinutesToDate(currentTime, task.estimatedTime);
      currentTime = new Date(newTask.completionTime);
      return newTask;
    });
    setTasks(newTasks);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Task Manager</h1>
      <AddTaskForm onAddTask={addTask} />
      <h2 className="text-2xl font-bold">Ongoing Tasks</h2>
      <TaskList tasks={tasks} onCompleteTask={completeTask} onAdjustFirstTask={adjustFirstTask} />
      <h2 className="text-2xl font-bold">Completed Tasks</h2>
      <CompletedTaskList tasks={completedTasks} />
    </div>
  );
}

