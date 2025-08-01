'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@prisma/client';
import { FaTrash } from 'react-icons/fa';

// Helper to format date for input[type="date"]
const formatDateForInput = (date: string | Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// The type now correctly reflects that Date objects are converted to strings
// and Decimal objects are converted to numbers for serialization.
type SerializableProject = Omit<Project, 'totalBilledHours' | 'createdAt' | 'updatedAt' | 'startDate' | 'endDate'> & {
  totalBilledHours: number;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string | null;
};

interface EditProjectFormProps {
  project: SerializableProject;
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    totalBilledHours: project.totalBilledHours,
    startDate: formatDateForInput(project.startDate),
    endDate: formatDateForInput(project.endDate),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH', // Changed from PUT to PATCH to align with API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalBilledHours: Number(formData.totalBilledHours),
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/projects/${project.id}`);
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update project.');
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure you want to delete this project? This will also delete all of its phases and tasks. This action cannot be undone.')) {
      return;
    }
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete project.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md border">
      {/* Form fields remain the same */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Project Title</label>
        <input type="text" name="title" id="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
      </div>
      <div>
        <label htmlFor="totalBilledHours" className="block text-sm font-medium text-gray-700">Total Billed Hours</label>
        <input type="number" name="totalBilledHours" id="totalBilledHours" required value={formData.totalBilledHours} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" min="0" step="0.5"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" name="startDate" id="startDate" required value={formData.startDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
          <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      
      {/* --- ACTION BUTTONS --- */}
      <div className="flex justify-between items-center pt-4 border-t mt-8">
        {/* Delete Button (on the left) */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-2 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          <FaTrash />
          {isPending ? 'Deleting...' : 'Delete Project'}
        </button>

        {/* Cancel and Save Buttons (on the right) */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            disabled={isPending}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}