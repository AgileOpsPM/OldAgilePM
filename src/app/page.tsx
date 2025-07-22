import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If the user is already logged in, redirect them directly to the dashboard.
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-800">
          Welcome to AgileOps PM
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Your streamlined solution for managing projects, phases, and billing with clarity and precision.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link 
            href="/login"
            className="inline-block py-3 px-6 text-lg font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </Link>
          <Link 
            href="/register"
            className="inline-block py-3 px-6 text-lg font-medium rounded-md text-blue-500 bg-white border border-blue-500 hover:bg-blue-50"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}