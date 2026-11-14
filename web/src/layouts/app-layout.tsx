import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Navigate, Outlet } from 'react-router'
import { RealtimeStatus } from '@/components/realtime-status'
import { Toaster } from '@/components/toaster'
import { session } from '@/services/api/session'

export default function AppLayout() {
  if (!session.getToken()) return <Navigate to="/login" replace />

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
            />
            <AppBreadcrumb />
          </div>
          <div className="ml-auto px-4">
            <RealtimeStatus />
          </div>
        </header>

        <section className="flex flex-col gap-4 p-4">
          <Outlet />
        </section>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  )
}
