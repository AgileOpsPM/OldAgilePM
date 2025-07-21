'use client';

import { useSession, signOut } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">
          Welcome to Your Dashboard
        </h1>
        <p className="mb-6 text-lg text-gray-600">
          You are signed in successfully!
        </p>
        
        <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-6 text-left">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Session Details</h2>
          <p className="mb-2">
            <span className="font-semibold">User ID:</span> {session?.user?.id}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Name:</span> {session?.user?.name}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Email:</span> {session?.user?.email}
          </p>
          <p>
            <span className="font-semibold">Role:</span> <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">{session?.user?.role}</span>
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-8 w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}