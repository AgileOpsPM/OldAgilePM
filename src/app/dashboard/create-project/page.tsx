'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Helper function to format today's date as YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function CreateProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalBilledHours, setTotalBilledHours] = useState('');
  // Add state for the new date fields
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          totalBilledHours: parseFloat(totalBilledHours),
          // Include dates in the request body
          startDate,
          // Only include endDate if it has a value
          endDate: endDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project.');
      }

      router.push('/dashboard');
      router.refresh(); // Important to refresh the dashboard data

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Create New Project</h1>
            <p className="text-lg text-gray-600 mt-1">Fill out the details below to start a new project.</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white p-8 shadow-md rounded-lg border border-gray-200">
            <div className="space-y-6">
              {/* Title, Description, Hours fields remain the same */}
              <div>
                <label htmlFor="project-title" className="block text-sm font-medium text-gray-700">Project Title</label>
                <input type="text" id="project-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full" required />
              </div>
              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full" />
              </div>
              <div>
                <label htmlFor="total-hours" className="block text-sm font-medium text-gray-700">Total Billed Hours</label>
                <input type="number" id="total-hours" value={totalBilledHours} onChange={(e) => setTotalBilledHours(e.target.value)} className="mt-1 block w-full" step="0.5" min="0" required />
              </div>

              {/* --- NEW DATE FIELDS --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full" required />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                  <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full" min={startDate} />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <div className="mt-8 flex justify-end gap-4">
              <Link href="/dashboard" className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400">
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}