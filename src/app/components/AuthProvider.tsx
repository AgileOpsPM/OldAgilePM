'use client';

import { SessionProvider } from 'next-auth/react';

type Props = {
  children?: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  // The SessionProvider makes the session data available to all
  // components wrapped within it.
  return <SessionProvider>{children}</SessionProvider>;
}