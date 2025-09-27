"use client";

import {
  Calculator,
  CalendarDays,
  Cog,
  Crown,
  DollarSign,
  FileText,
  FolderOpen,
  Handshake,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  User,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsDropdown } from "@/components/ui/notifications";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// Estrutura de categorias para administradores
const adminCategories = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Médicos",
    icon: Stethoscope,
    items: [
      {
        title: "Médicos",
        url: "/doctors",
        icon: Stethoscope,
      },
      {
        title: "Especialidades",
        url: "/medical-specialties",
        icon: Stethoscope,
      },
      {
        title: "Modalidades",
        url: "/appointment-modalities",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Pacientes",
    icon: UsersRound,
    items: [
      {
        title: "Pacientes",
        url: "/patients",
        icon: UsersRound,
      },
      {
        title: "Cliente Ouro",
        url: "/gold-clients",
        icon: Crown,
      },
      {
        title: "Parceiros",
        url: "/partners",
        icon: Handshake,
      },
    ],
  },
  {
    title: "Agendamentos",
    icon: CalendarDays,
    items: [
      {
        title: "Agendamentos",
        url: "/appointments",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    items: [
      {
        title: "Financeiro",
        url: "/financial",
        icon: DollarSign,
      },
      {
        title: "Caixa Diário",
        url: "/daily-cash",
        icon: Calculator,
      },
    ],
  },
  {
    title: "Documentos",
    icon: FolderOpen,
    items: [
      {
        title: "Documentos",
        url: "/documents",
        icon: FileText,
      },
      {
        title: "Templates",
        url: "/documents/templates",
        icon: FileText,
      },
    ],
  },
  {
    title: "Configurações",
    icon: Cog,
    items: [
      {
        title: "Configurações",
        url: "/clinic-settings",
        icon: Settings,
      },
    ],
  },
];

// Estrutura de categorias para médicos
const doctorCategories = [
  {
    title: "Agendamentos",
    icon: CalendarDays,
    items: [
      {
        title: "Meus Agendamentos",
        url: "/appointments",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Pacientes",
    icon: UsersRound,
    items: [
      {
        title: "Meus Pacientes",
        url: "/patients",
        icon: UsersRound,
      },
    ],
  },
  {
    title: "Documentos",
    icon: FolderOpen,
    items: [
      {
        title: "Meus Documentos",
        url: "/documents",
        icon: FileText,
      },
    ],
  },
  {
    title: "Perfil",
    icon: User,
    items: [
      {
        title: "Meu Perfil",
        url: "/profile",
        icon: User,
      },
    ],
  },
];

export function AppSidebar() {
  const router = useRouter();
  const session = authClient.useSession();
  const pathname = usePathname();

  // Determinar quais categorias mostrar baseado no role do usuário
  const categories =
    session.data?.user?.role === "doctor" ? doctorCategories : adminCategories;

  // Função para gerar siglas da clínica
  const getClinicInitials = (clinicName: string) => {
    if (!clinicName) return "C";

    const words = clinicName.trim().split(/\s+/);
    if (words.length === 1) {
      // Se for uma palavra só, pegar as primeiras 2 letras
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Se for múltiplas palavras, pegar a primeira letra de cada palavra (máximo 2)
      return words
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <Image src="/logo.svg" alt="Doutor Agenda" width={136} height={28} />
          <NotificationsDropdown />
        </div>
      </SidebarHeader>
      <SidebarContent className="space-y-0">
        {categories.map((category) => (
          <SidebarGroup key={category.title} className="mb-0 space-y-0 pb-0">
            <SidebarGroupLabel className="text-muted-foreground mb-0 px-2 py-0 text-sm font-medium">
              {category.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="mb-0 pb-0">
              <SidebarMenu className="space-y-0">
                {category.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="h-6 px-2"
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback>
                      {getClinicInitials(
                        session.data?.user?.clinic?.name || "",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      {session.data?.user?.clinic?.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
