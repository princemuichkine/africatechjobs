import { redirect } from 'next/navigation';

export default function JobsPage() {
  // Redirect to the main page since that's now our job listing
  redirect('/');
}