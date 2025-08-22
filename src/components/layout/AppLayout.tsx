import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-dvh">
      <Topbar />
      <div className="container grid grid-cols-1 md:grid-cols-[15rem_1fr] gap-6 py-6">
        <Sidebar />
        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
