import Link from 'next/link';
// Import new, more specific calendar icons
import { FaEdit, FaCalendarPlus, FaCalendarTimes } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';

// Helper function to format dates nicely
function formatDate(dateString: string | null) {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface ProjectHeaderProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    totalBilledHours: number;
  };
  totalAllocatedHours: number;
}

export default function ProjectHeader({ project, totalAllocatedHours }: ProjectHeaderProps) {
  const remainingHours = project.totalBilledHours - totalAllocatedHours;
  const isOverBudget = remainingHours < 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
      <div className="flex justify-between items-start">
        {/* Main Info */}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
          <p className="text-gray-600 mt-2 max-w-prose">{project.description}</p>
        </div>
        {/* Edit Button */}
        <Link 
          href={`/dashboard/projects/${project.id}/edit`} 
          className="flex-shrink-0 ml-4 flex items-center gap-2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <FaEdit /> Edit Project
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-gray-600">
        {/* --- UPDATED DATES SECTION --- */}
        <div className="flex items-center gap-2" title="Start Date">
          <FaCalendarPlus className="text-green-500 h-5 w-5" />
          <span className="font-semibold">{formatDate(project.startDate)}</span>
        </div>
        <div className="flex items-center gap-2" title="End Date">
          <FaCalendarTimes className="text-red-500 h-5 w-5" />
          <span className="font-semibold">{formatDate(project.endDate)}</span>
        </div>
        
        {/* Hours */}
        <div className="flex items-center gap-2" title="Billed vs. Allocated Hours">
          <FiClock className="text-gray-400 h-5 w-5" />
          <span className="font-medium">
            <span className="text-gray-500">Billed:</span> {project.totalBilledHours} hrs
          </span>
          <span className="mx-1">|</span>
          <span className="font-medium">
            <span className="text-gray-500">Allocated:</span> {totalAllocatedHours} hrs
          </span>
        </div>

        {/* Remaining Hours Badge */}
        <div 
          className={`px-3 py-1 rounded-full font-bold text-xs
            ${isOverBudget 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
            }`}
          title="Remaining budget hours"
        >
          {isOverBudget 
            ? `${Math.abs(remainingHours)} HRS OVER BUDGET` 
            : `${remainingHours} HRS REMAINING`
          }
        </div>
      </div>
    </div>
  );
}