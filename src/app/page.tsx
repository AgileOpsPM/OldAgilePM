import { redirect } from 'next/navigation';

/**
 * The homepage for the application.
 * This component will immediately redirect the user to the /login page.
 */
export default function HomePage() {
  redirect('/login');
}