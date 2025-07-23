'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Task } from '@prisma/client';
import { FaTrash } from 'react-icons/fa';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    const previousState = isCompleted;
    setIsCompleted(!previousState); // Optimistic update

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !previousState }),
      });
      if (!response.ok) throw new Error('Failed to update task.');
      router.refresh(); // Refresh to update the "X / Y" count in the parent
    } catch (err) {
      setIsCompleted(previousState); // Revert on failure
      setError('Could not update task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task.');
      router.refresh();
    } catch (err) {
      setError('Could not delete task.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`
      flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 shadow-sm
      transition-all duration-200
      ${isCompleted ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}
      ${isLoading ? 'animate-pulse' : ''}
    `}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggleComplete}
          disabled={isLoading}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <span className={`
          text-base font-medium
          ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}
        `}>
          {task.title}
        </span>
      </div>
      <button 
        onClick={handleDelete} 
        disabled={isLoading}
        className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
        aria-label="Delete task"
      >
        <FaTrash />
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}