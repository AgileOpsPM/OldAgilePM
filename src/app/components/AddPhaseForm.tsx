'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';

interface AddPhaseFormProps {
  projectId: string;
  totalBilledHours: number;
  currentAllocatedHours: number; // <-- The missing prop is now added
}

export default function AddPhaseForm({ projectId, totalBilledHours, currentAllocatedHours }: AddPhaseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [allocatedHours, setAllocatedHours] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- UPDATED VALIDATION LOGIC ---
    const remainingHours = totalBilledHours - currentAllocatedHours;
    if (allocatedHours > remainingHours) {
      setError(`Hours cannot exceed the remaining unallocated hours for the project (${remainingHours} hrs left).`);
      return;
    }
    if (allocatedHours <= 0) {
      setError('Allocated hours must be a positive number.');
      return;
    }
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/phases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, allocatedHours }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add phase.');
      }

      // Reset form
      setTitle('');
      setAllocatedHours(0);
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
        Add New Phase
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border border-gray-300 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Add New Phase</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="phase-title" className="block text-sm font-medium text-gray-700">Phase Title</label>
          <input
            id="phase-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Discovery & Planning"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="phase-hours" className="block text-sm font-medium text-gray-700">Allocated Hours</label>
          <input
            id="phase-hours"
            type="number"
            value={allocatedHours}
            onChange={(e) => setAllocatedHours(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            min="0.5"
            step="0.5"
          />
        </div>
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
          {isLoading ? 'Adding...' : 'Add Phase'}
        </button>
      </div>
    </form>
  );
}