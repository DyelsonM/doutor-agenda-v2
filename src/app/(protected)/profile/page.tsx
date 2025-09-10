import { eq } from "drizzle-orm";
import { CalendarIcon, ClockIcon, DollarSignIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import { getAvailability } from "../doctors/_helpers/availability";

const ProfilePage = async () => {
  const session = await getAuthSession();

  // Apenas médicos podem acessar esta página
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  // Buscar dados do médico
  const doctorId = await getDoctorIdFromUser(session.user.id);
  if (!doctorId) {
    redirect("/unauthorized");
  }

  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.id, doctorId),
  });

  if (!doctor) {
    redirect("/unauthorized");
  }

  const availability = getAvailability(doctor);
  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Meu Perfil</PageTitle>
          <PageDescription>Informações do seu perfil médico</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {doctorInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{doctor.name}</h2>
                  <p className="text-muted-foreground">{doctor.specialty}</p>
                  <p className="text-muted-foreground text-sm">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2" />
                {availability.from.format("dddd")} a{" "}
                {availability.to.format("dddd")}
              </Badge>
              <Badge variant="outline" className="w-full justify-start">
                <ClockIcon className="mr-2" />
                {availability.from.format("HH:mm")} às{" "}
                {availability.to.format("HH:mm")}
              </Badge>
              <Badge variant="outline" className="w-full justify-start">
                <DollarSignIcon className="mr-2" />
                {formatCurrencyInCents(doctor.appointmentPriceInCents)}
              </Badge>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Email de Login
                  </label>
                  <p className="text-sm">{session.user.email}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Tipo de Conta
                  </label>
                  <p className="text-sm">Médico</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Clínica
                  </label>
                  <p className="text-sm">{session.user.clinic?.name}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    ID do Médico
                  </label>
                  <p className="font-mono text-sm">{doctor.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ProfilePage;
