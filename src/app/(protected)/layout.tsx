import { SidebarProvider } from "@/components/ui/sidebar";
import { ClientProviders } from "@/components/client-providers";

import { AppSidebar } from "./_components/app-sidebar";
import { PayablesChecker } from "./_components/payables-checker";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ClientProviders>
        <AppSidebar />
        <PayablesChecker />
        <main className="w-full">
          <div className="p-6">{children}</div>
        </main>
      </ClientProviders>
    </SidebarProvider>
  );
}
