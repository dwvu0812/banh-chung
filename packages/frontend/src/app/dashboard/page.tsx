import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardClient />
    </ProtectedRoute>
  );
}
