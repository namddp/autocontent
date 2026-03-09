import { redirect } from 'next/navigation';

// Root route — redirect về dashboard (middleware xử lý auth)
export default function RootPage() {
  redirect('/dashboard');
}
