import Link from 'next/link';
import ProgressBar from './ProgressBar';
import { FaTasks, FaClipboardList, FaCalendarAlt } from 'react-icons/fa';

// Define a type for the complex project object we'll pass as a prop
type ProjectCardProps = {
  project: {
    id: string;
    title: string;
    description: string | null;
    endDate: Date | null;
    phases: {
      isCompleted: boolean;
      allocatedHours: number;
      tasks: {
        isCompleted: boolean;
      }[];
    }[];
  };
};

export default function ProjectCard({ project }: ProjectCardProps) {
  // --- Data Calculations ---
  const totalPhases = project.phases.length;
  const completedPhases = project.phases.filter(p => p.isCompleted).length;

  const allTasks = project.phases.flatMap(p => p.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.isCompleted).length;

  // --- Corrected Budget Logic ---
  // The total budget is the sum of all hours allocated to every phase.
  const totalAllocatedHours = project.phases.reduce(
    (sum, p) => sum + p.allocatedHours,
    0
  );
  // Budget "spent" is the sum of hours from phases marked as complete.
  const billedHours = project.phases
    .filter(p => p.isCompleted)
    .reduce((sum, p) => sum + p.allocatedHours, 0);

  // --- Conditional Styling ---
  const budgetUsage = totalAllocatedHours > 0 ? (billedHours / totalAllocatedHours) * 100 : 0;
  let budgetColorClass = 'bg-green-500';
  if (budgetUsage > 80) budgetColorClass = 'bg-yellow-500';
  if (budgetUsage >= 100) budgetColorClass = 'bg-red-500'; // Use red for 100% or over
  
  const isOverdue = project.endDate ? new Date(project.endDate) < new Date() : false;

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex flex-col h-full cursor-pointer">
        {/* Card Header */}
        <h3 className="text-xl font-bold text-gray-800 truncate mb-2">{project.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
          {project.description || 'No description provided.'}
        </p>

        {/* Progress Bars */}
        <div className="space-y-4 mb-6">
          {/* UPDATED: This progress bar now tracks PHASES */}
          <ProgressBar 
            label="Phases" 
            value={completedPhases} 
            max={totalPhases} 
            colorClass="bg-blue-500"
          />
          {/* UPDATED: This progress bar uses the corrected budget logic */}
          <ProgressBar
            label="Budget"
            value={billedHours}
            max={totalAllocatedHours}
            colorClass={budgetColorClass}
          />
        </div>

        {/* Key Metrics */}
        <div className="mt-auto space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <FaClipboardList className="mr-2 text-gray-400" />
            <span>Phases: {completedPhases} / {totalPhases} completed</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaTasks className="mr-2 text-gray-400" />
            <span>Tasks: {completedTasks} / {totalTasks} completed</span>
          </div>
          <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <span>
              {project.endDate 
                ? `Due: ${new Date(project.endDate).toLocaleDateString()}`
                : 'No due date set'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}