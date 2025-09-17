import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getDashboard } from "@/data/get-dashboard";
import { getAuthSession, requireAdmin } from "@/lib/auth-utils";

import AppointmentsOnlyChart from "./_components/appointments-only-chart";
import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import { TodayAppointmentsTable } from "./_components/today-appointments-table";
import TopDoctors from "./_components/top-doctors";
import TopSpecialties from "./_components/top-specialties";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await getAuthSession();

  // Médicos devem ser redirecionados para seus agendamentos
  if (session.user.role === "doctor") {
    redirect("/appointments");
  }

  // Apenas administradores podem ver o dashboard
  requireAdmin(session);

  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }
  const {
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  } = await getDashboard({
    from,
    to,
    session: {
      user: {
        clinic: {
          id: session.user.clinic.id,
        },
      },
    },
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Tenha uma visão geral da sua clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalAppointments={totalAppointments.total}
          totalPatients={totalPatients.total}
          totalDoctors={totalDoctors.total}
        />
        <AppointmentsOnlyChart dailyAppointmentsData={dailyAppointmentsData} />
        <div className="grid grid-cols-[1fr_1fr] gap-4">
          <TopDoctors doctors={topDoctors} />
          <TopSpecialties topSpecialties={topSpecialties} />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground" />
              <CardTitle className="text-base">Agendamentos de hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TodayAppointmentsTable appointments={todayAppointments} />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
