import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import SignOutButton from '@/app/components/SignOutButton';
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

async function getProjectsForUser(userId: string) {
  // This function is safe, as it's only called with a valid userId.
  const projects = await prisma.project.findMany({
    where: {
      consultantId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return projects;
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // --- THIS IS THE CRITICAL SAFEGUARD ---
  // If the session is null (e.g., expired) or doesn't contain a user and ID,
  // we must immediately redirect to the login page.
  // This prevents the code below from ever running with invalid data.
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  // Because of the check above, we can now be 100% certain that "session.user.id" exists.
  const projects = await getProjectsForUser(session.user.id);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            {/* We can also safely access user's name here */}
            <p className="text-lg text-gray-600">Welcome back, {session.user.name || 'Consultant'}.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/create-project"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Project
            </Link>
            <SignOutButton />
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Projects</h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                  <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-200 cursor-pointer">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description || 'No description provided.'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Total Hours: {project.totalBilledHours.toString()}</span>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                        Active
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold text-gray-800">No Projects Yet</h3>
              <p className="text-gray-500 mt-2">Click the "Create New Project" button to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}