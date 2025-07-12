import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <SidebarInset>
          {/* Header with sidebar trigger */}
          <header className="h-16 border-b bg-white/80 backdrop-blur-sm flex items-center px-4 shadow-sm">
            <SidebarTrigger className="mr-4" />
            
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Stream Monitoring Dashboard
              </h1>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}