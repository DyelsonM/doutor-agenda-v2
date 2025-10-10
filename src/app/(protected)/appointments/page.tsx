import { and, eq, gte, lte } from "drizzle-orm";
import dayjs from "dayjs";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { getAuthSession, getDoctorIdFromUser } from "@/lib/auth-utils";

import AddAppointmentButton from "./_components/add-appointment-button";
import { AppointmentsView } from "./_components/appointments-view";

const AppointmentsPage = async () => {
  const session = await getAuthSession();

  // Otimização: Carregar apenas agendamentos relevantes (últimos 3 meses + próximos 6 meses)
  const startDate = dayjs().subtract(3, "months").startOf("day").toDate();
  const endDate = dayjs().add(6, "months").endOf("day").toDate();

  let appointmentsFilter;
  let patientsFilter;
  let doctorsFilter;

  if (session.user.role === "admin") {
    // Admin vê todos os agendamentos da clínica (com filtro de data)
    appointmentsFilter = and(
      eq(appointmentsTable.clinicId, session.user.clinic.id),
      gte(appointmentsTable.date, startDate),
      lte(appointmentsTable.date, endDate),
    );
    patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
    doctorsFilter = eq(doctorsTable.clinicId, session.user.clinic.id);
  } else {
    // Médico vê apenas seus agendamentos (com filtro de data)
    const doctorId = await getDoctorIdFromUser(session.user.id);
    if (!doctorId) {
      // Se médico não está vinculado ainda, mostrar apenas estrutura vazia
      // Isso permite que o sistema funcione enquanto o admin vincula o usuário
      appointmentsFilter = eq(appointmentsTable.id, "non-existent-id");
      patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
      doctorsFilter = eq(doctorsTable.clinicId, session.user.clinic.id);
    } else {
      appointmentsFilter = and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        eq(appointmentsTable.doctorId, doctorId),
        gte(appointmentsTable.date, startDate),
        lte(appointmentsTable.date, endDate),
      );
      patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
      doctorsFilter = and(
        eq(doctorsTable.clinicId, session.user.clinic.id),
        eq(doctorsTable.id, doctorId),
      );
    }
  }

  // Otimização: Adicionar ordenação e limites razoáveis
  const [patients, doctors, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: patientsFilter,
      orderBy: (patients, { asc }) => [asc(patients.name)],
      limit: 500, // Limite para dropdowns
    }),
    db.query.doctorsTable.findMany({
      where: doctorsFilter,
      orderBy: (doctors, { asc }) => [asc(doctors.name)],
      limit: 100, // Limite para dropdowns
    }),
    // Otimização: Carregar apenas campos necessários + filtro de data
    db.query.appointmentsTable.findMany({
      where: appointmentsFilter,
      with: {
        patient: {
          columns: {
            id: true,
            name: true,
            phoneNumber: true,
            sex: true,
          },
        },
        doctor: {
          columns: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: (appointments, { asc }) => [asc(appointments.date)],
    }),
  ]);

  // Verificar se médico está vinculado
  const isDoctorLinked =
    session.user.role === "admin" ||
    (session.user.role === "doctor" &&
      (await getDoctorIdFromUser(session.user.id)));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            {!isDoctorLinked && session.user.role === "doctor"
              ? "Aguardando vinculação do seu perfil pelo administrador"
              : "Gerencie os agendamentos da sua clínica (últimos 3 meses + próximos 6 meses)"}
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          {isDoctorLinked && (
            <AddAppointmentButton patients={patients} doctors={doctors} />
          )}
        </PageActions>
      </PageHeader>
      <PageContent>
        {!isDoctorLinked && session.user.role === "doctor" ? (
          <div className="py-10 text-center">
            <h3 className="mb-2 text-lg font-semibold">Perfil não vinculado</h3>
            <p className="text-muted-foreground">
              Entre em contato com o administrador da clínica para vincular seu
              perfil e acessar os agendamentos.
            </p>
          </div>
        ) : (
          <AppointmentsView
            appointments={appointments}
            doctors={doctors}
            patients={patients}
            userRole={session.user.role}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;
