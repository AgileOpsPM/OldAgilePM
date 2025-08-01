import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import EditProjectForm from '@/app/components/(project & task comps)/EditProjectForm';

const prisma = new PrismaClient();

async function getProjectForEdit(projectId: string, userId:string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      consultantId: userId,
    },
  });
  return project;
}

export default async function EditProjectPage({ params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const project = await getProjectForEdit(params.projectId, session.user.id);

  if (!project) {
    notFound();
  }

  // --- THE FIX ---
  // Convert the full project object to a plain, serializable object.
  // This now includes converting the date fields.
  const serializableProject = {
    ...project,
    totalBilledHours: project.totalBilledHours.toNumber(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    // Convert dates to simple ISO strings for the client
    startDate: project.startDate.toISOString(),
    endDate: project.endDate ? project.endDate.toISOString() : null,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Edit Project</h1>
            <p className="text-lg text-gray-600 mt-1">Update the details for "{project.title}"</p>
          </div>
          <EditProjectForm project={serializableProject} />
        </div>
      </div>
    </div>
  );
}