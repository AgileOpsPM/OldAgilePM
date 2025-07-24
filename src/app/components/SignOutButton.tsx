'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' }); // Redirect to login page after sign out
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors"
    >
      Sign Out
    </button>
  );
}