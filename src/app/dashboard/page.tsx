import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import SignOutButton from '@/app/components/SignOutButton';
import { redirect } from "next/navigation";
import ProjectCard from '@/app/components/ProjectCard'; // Import the new card
import { FaPlus } from "react-icons/fa";

const prisma = new PrismaClient();

async function getProjectsForDashboard(userId: string) {
  const projects = await prisma.project.findMany({
    where: { consultantId: userId },
    orderBy: { createdAt: 'desc' },
    // Include all the nested data needed for the dashboard card
    include: {
      phases: {
        select: {
          isCompleted: true,
          allocatedHours: true,
          tasks: {
            select: {
              isCompleted: true,
            },
          },
        },
      },
    },
  });
  return projects;
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const projectsData = await getProjectsForDashboard(session.user.id);
  
  // Convert Decimal fields to numbers for client-side components
  const projects = projectsData.map(p => ({
    ...p,
    totalBilledHours: p.totalBilledHours.toNumber(),
    phases: p.phases.map(phase => ({
      ...phase,
      allocatedHours: phase.allocatedHours.toNumber(),
    }))
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        {/* Page Header - Preserved from your original file */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome back, {session.user.name || 'Consultant'}.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/create-project"
              className="inline-flex items-center justify-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus />
              Create New Project
            </Link>
            <SignOutButton />
          </div>
        </div>

        {/* Projects Grid - Using the new ProjectCard */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Projects</h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            // Preserved your original empty state message
            <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold text-gray-800">No Projects Yet</h3>
              <p className="text-gray-500 mt-2">Click the "Create New Project" button to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}