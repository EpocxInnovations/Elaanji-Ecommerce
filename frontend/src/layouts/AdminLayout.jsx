import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '../admin/components/AdminSidebar'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-paper">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
