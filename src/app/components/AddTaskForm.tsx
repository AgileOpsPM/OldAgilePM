'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';

interface AddTaskFormProps {
  phaseId: string;
}

export default function AddTaskForm({ phaseId }: AddTaskFormProps) {
  const router = useRouter();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/phases/${phaseId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task.');
      }

      // Reset form on success
      setTitle('');
      setDescription('');
      setIsFormVisible(false);
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isFormVisible) {
    return (
      <button
        onClick={() => setIsFormVisible(true)}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition"
      >
        <FaPlus />
        Add New Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border border-gray-300 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Create New Task</h3>
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Add more details or notes..."
          className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => setIsFormVisible(false)}
          disabled={isLoading}
          className="py-2 px-4 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
        >
          {isLoading ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}