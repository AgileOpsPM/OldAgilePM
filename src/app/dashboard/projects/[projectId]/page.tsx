import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PhaseEditor from '@/app/components/PhaseEditor';
import AddPhaseForm from '@/app/components/AddPhaseForm';
import { FaCalendarAlt, FaEdit } from 'react-icons/fa';

const prisma = new PrismaClient();

// Helper to format dates in a user-friendly way
const formatDate = (date: Date | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

async function getProjectDetails(projectId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      phases: {
        orderBy: [
          { isCompleted: 'asc' },
          { createdAt: 'asc' },
        ],
        // --- THIS IS THE NEW PART ---
        // Include all tasks for each phase, and sort them too.
        include: {
          tasks: {
            orderBy: [
              { isCompleted: 'asc' },
              { createdAt: 'asc' },
            ],
          },
        },
      },
    },
  });

  return project;
}

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const project = await getProjectDetails(params.projectId);

  if (!project) {
    notFound();
  }

  const totalAllocatedHours = project.phases.reduce((sum, phase) => sum + phase.allocatedHours.toNumber(), 0);
  const totalBilledHours = project.totalBilledHours.toNumber();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link href="/dashboard" className="text-blue-500 hover:underline mb-4 block text-sm">&larr; Back to Dashboard</Link>
              <h1 className="text-4xl font-bold text-gray-800">{project.title}</h1>
              <p className="text-lg text-gray-600 mt-2 max-w-3xl">{project.description || 'No description provided.'}</p>
            </div>
            <Link 
              href={`/dashboard/projects/${project.id}/edit`}
              className="inline-flex items-center gap-2 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
            >
              <FaEdit />
              Edit Project
            </Link>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Timeline</h3>
                <div className="flex items-center space-x-6 text-gray-700">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-green-500" />
                    <div>
                      <span className="text-xs text-gray-500">Start Date</span>
                      <p className="font-medium">{formatDate(project.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-red-500" />
                    <div>
                      <span className="text-xs text-gray-500">End Date</span>
                      <p className="font-medium">{project.endDate ? formatDate(project.endDate) : 'Ongoing'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Budget</h3>
                 <div className="text-sm font-medium text-gray-700">
                  Total Billed Hours: <span className="font-bold">{totalBilledHours}</span>
                </div>
                <div className="mt-1 text-sm font-medium text-gray-700">
                  Total Allocated Hours: <span className="font-bold">{totalAllocatedHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Phase Form */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Phase</h2>
          <AddPhaseForm
            projectId={project.id}
            totalBilledHours={totalBilledHours}
            totalAllocatedHours={totalAllocatedHours}
          />
        </div>

        {/* Phases List */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Project Phases</h2>
          {project.phases.length > 0 ? (
            <div className="space-y-4">
              {project.phases.map((phase) => (
                <PhaseEditor 
                  key={phase.id} 
                  phase={{
                    ...phase,
                    allocatedHours: phase.allocatedHours.toNumber(),
                  }}
                  totalBilledHours={totalBilledHours}
                  totalAllocatedHours={totalAllocatedHours}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-gray-700">No Phases Yet</h3>
              <p className="text-gray-500 mt-1">Use the form above to add the first phase to this project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}