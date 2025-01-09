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
  startTime: string;
  completionTime: string;
}

export function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [completedTasks, setCompletedTasks] = useLocalStorage<Task[]>('completedTasks', []);
  const [nextId, setNextId] = useLocalStorage('nextId', 1);

  useEffect(() => {
    // Convert stored dates to ISO strings
    setTasks(tasks.map(task => ({
      ...task,
      startTime: new Date(task.startTime).toISOString(),
      completionTime: task.completionTime ? new Date(task.completionTime).toISOString() : new Date().toISOString()
    })));
    setCompletedTasks(completedTasks.map(task => ({
      ...task,
      completionTime: new Date(task.completionTime).toISOString()
    })));
  }, []);

  const addTask = (taskName: string, estimatedTime: number) => {
    const now = new Date();
    const newTask: Task = {
      id: nextId,
      name: taskName,
      estimatedTime,
      startTime: now.toISOString(),
      completionTime: addMinutesToDate(now, estimatedTime).toISOString()
    };
    setTasks([...tasks, newTask]);
    setNextId(nextId + 1);
    updateTaskTimes([...tasks, newTask]);
  };

  const completeTask = (taskId: number) => {
    const taskToComplete = tasks.find(task => task.id === taskId);
    if (taskToComplete) {
      setCompletedTasks([...completedTasks, { ...taskToComplete, completionTime: new Date().toISOString() }]);
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

  const deleteTask = (taskId: number) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    updateTaskTimes(updatedTasks);
  };

  const deleteCompletedTask = (taskId: number) => {
    setCompletedTasks(completedTasks.filter(task => task.id !== taskId));
  };

  const moveTask = (taskId: number, direction: 'up' | 'down') => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    const task = newTasks[taskIndex];
    
    if (direction === 'up' && taskIndex > 0) {
      newTasks[taskIndex] = newTasks[taskIndex - 1];
      newTasks[taskIndex - 1] = task;
    } else if (direction === 'down' && taskIndex < newTasks.length - 1) {
      newTasks[taskIndex] = newTasks[taskIndex + 1];
      newTasks[taskIndex + 1] = task;
    }

    setTasks(newTasks);
    updateTaskTimes(newTasks);
  };

  const updateTaskTimes = (updatedTasks: Task[]) => {
    let currentTime = new Date();
    const newTasks = updatedTasks.map(task => {
      const newTask = { ...task, startTime: currentTime.toISOString() };
      newTask.completionTime = addMinutesToDate(currentTime, task.estimatedTime).toISOString();
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
      <TaskList 
        tasks={tasks} 
        onCompleteTask={completeTask} 
        onAdjustFirstTask={adjustFirstTask}
        onDeleteTask={deleteTask}
        onMoveTask={moveTask}
      />
      <h2 className="text-2xl font-bold">Completed Tasks</h2>
      <CompletedTaskList tasks={completedTasks} onDeleteTask={deleteCompletedTask} />
    </div>
  );
}

