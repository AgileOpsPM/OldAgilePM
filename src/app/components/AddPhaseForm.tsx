'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddPhaseFormProps {
  projectId: string;
  totalBilledHours: number;
  totalAllocatedHours: number;
}

export default function AddPhaseForm({ projectId, totalBilledHours, totalAllocatedHours }: AddPhaseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const allocatedHours = parseFloat(hours);

    if (!title.trim()) {
      setError('Phase title is required.');
      setIsLoading(false);
      return;
    }
    if (isNaN(allocatedHours) || allocatedHours <= 0) {
      setError('Please enter a valid, positive number for hours.');
      setIsLoading(false);
      return;
    }

    const newTotalAllocated = totalAllocatedHours + allocatedHours;
    if (newTotalAllocated > totalBilledHours) {
      setError(`This would make the total allocated hours ${newTotalAllocated}, exceeding the project limit of ${totalBilledHours}.`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/phases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          allocatedHours,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add phase.');
      }

      setTitle('');
      setHours('');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // The <h2> and its wrapping <div> have been removed from this component.
  // The heading is now correctly placed only on the page itself.
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="phase-title" className="block text-sm font-medium text-gray-700">
            Phase Title
          </label>
          <input
            type="text"
            id="phase-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Final Testing & Deployment"
            required
          />
        </div>
        <div>
          <label htmlFor="phase-hours" className="block text-sm font-medium text-gray-700">
            Allocated Hours
          </label>
          <input
            type="number"
            id="phase-hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 20"
            step="0.5"
            min="0"
            required
          />
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <div className="mt-6 text-right">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Adding...' : 'Add Phase'}
        </button>
      </div>
    </form>
  );
}