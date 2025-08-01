'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Task } from '@prisma/client';
import { FaTimes } from 'react-icons/fa';

interface TaskDescriptionModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDescriptionModal({ task, onClose }: TaskDescriptionModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState(task.description || '');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (response.ok) {
        setSuccessMessage('Saved!');
        router.refresh(); // Refresh data on the page if needed
      } else {
        setError('Failed to save description.');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg z-50 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h2>
        <p className="text-sm text-gray-500 mb-4">Notes & Description</p>
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add notes here..."
        />
        
        <div className="flex justify-between items-center mt-4">
          <div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="py-2 px-4 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}