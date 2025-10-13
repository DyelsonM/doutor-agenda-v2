import { and, eq } from "drizzle-orm";

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

  let appointmentsFilter;
  let patientsFilter;
  let doctorsFilter;

  if (session.user.role === "admin") {
    // Admin vê todos os agendamentos da clínica
    appointmentsFilter = eq(appointmentsTable.clinicId, session.user.clinic.id);
    patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
    doctorsFilter = eq(doctorsTable.clinicId, session.user.clinic.id);
  } else {
    // Médico vê apenas seus agendamentos
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
      );
      patientsFilter = eq(patientsTable.clinicId, session.user.clinic.id);
      doctorsFilter = and(
        eq(doctorsTable.clinicId, session.user.clinic.id),
        eq(doctorsTable.id, doctorId),
      );
    }
  }

  const [patients, doctors, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: patientsFilter,
      orderBy: (patients, { asc }) => [asc(patients.name)],
    }),
    db.query.doctorsTable.findMany({
      where: doctorsFilter,
      orderBy: (doctors, { asc }) => [asc(doctors.name)],
    }),
    db.query.appointmentsTable.findMany({
      where: appointmentsFilter,
      with: {
        patient: true,
        doctor: true,
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
              : "Gerencie os agendamentos da sua clínica"}
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
