import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

// This is a Server Component, so we can fetch data directly.
async function getProjectDetails(projectId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      phases: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return project;
}

// The params object is automatically passed to dynamic pages.
export default async function ProjectDetailPage({ params }: { params: { projectId:string } }) {
  const project = await getProjectDetails(params.projectId);

  // If no project is found for the given ID, show the 404 page.
  if (!project) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-500 hover:underline mb-4 block">&larr; Back to Dashboard</Link>
          <h1 className="text-4xl font-bold text-gray-800">{project.title}</h1>
          <p className="text-lg text-gray-600 mt-2">{project.description || 'No description provided.'}</p>
          <div className="mt-4 text-sm font-medium text-gray-500">
            Total Billed Hours: {project.totalBilledHours.toString()}
          </div>
        </div>

        {/* Phases Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Project Phases</h2>
          <div className="space-y-4">
            {project.phases.map((phase) => (
              <div key={phase.id} className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">{phase.title}</h3>
                  <div className="text-right">
                    {/* --- THIS IS THE FIX --- */}
                    <div className="text-lg font-bold text-gray-800">{phase.allocatedHours.toString()} hours</div>
                    <div className="text-sm text-gray-500">Allocated</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}