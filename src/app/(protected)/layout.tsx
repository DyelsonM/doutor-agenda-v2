import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./_components/app-sidebar";
import { PayablesChecker } from "./_components/payables-checker";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <PayablesChecker />
      <main className="w-full">
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
