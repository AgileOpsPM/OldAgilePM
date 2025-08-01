import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import PhaseEditor from '@/app/components/(project & task comps)/PhaseEditor';
import AddPhaseForm from '@/app/components/(project & task comps)/AddPhaseForm';
import ProjectHeader from '@/app/components/(project & task comps)/ProjectHeader';
import SignOutButton from '@/app/components/(project & task comps)/SignOutButton'; // Import the new button

const prisma = new PrismaClient();

async function getProjectDetails(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, consultantId: userId },
    include: {
      phases: {
        include: {
          tasks: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  return project;
}

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const project = await getProjectDetails(params.projectId, session.user.id);
  if (!project) notFound();

  const serializableProject = {
    ...project,
    totalBilledHours: project.totalBilledHours.toNumber(),
    startDate: project.startDate.toISOString(),
    endDate: project.endDate ? project.endDate.toISOString() : null,
    phases: project.phases.map(p => ({ ...p, allocatedHours: p.allocatedHours.toNumber() })),
  };

  const totalAllocatedHours = serializableProject.phases.reduce((sum, phase) => sum + phase.allocatedHours, 0);

  const activePhases = serializableProject.phases.filter(p => !p.isCompleted);
  const completedPhases = serializableProject.phases.filter(p => p.isCompleted);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        
        {/* --- TOP NAVIGATION BAR (FIXED) --- */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft />
            Back to Dashboard
          </Link>
          <SignOutButton />
        </div>
        
        <ProjectHeader 
          project={serializableProject}
          totalAllocatedHours={totalAllocatedHours}
        />
        
        <div className="mb-8">
          <AddPhaseForm 
            projectId={project.id}
            totalBilledHours={serializableProject.totalBilledHours}
            currentAllocatedHours={totalAllocatedHours}
          />
        </div>

        {/* Active Phases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Phases</h2>
          <div className="space-y-6">
            {activePhases.map(phase => (
              <PhaseEditor 
                key={phase.id}
                phase={phase}
                totalBilledHours={serializableProject.totalBilledHours}
                totalAllocatedHours={totalAllocatedHours}
              />
            ))}
            {activePhases.length === 0 && (
              <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">No Active Phases</h3>
                <p className="text-gray-500 mt-1">Add a new phase above to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Phases */}
        {completedPhases.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Completed Phases</h2>
            <div className="space-y-6">
              {completedPhases.map(phase => (
                <PhaseEditor 
                  key={phase.id}
                  phase={phase}
                  totalBilledHours={serializableProject.totalBilledHours}
                  totalAllocatedHours={totalAllocatedHours}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}