import { eq, and } from "drizzle-orm";

import { DataTable } from "@/components/ui/data-table";
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
import { appointmentsTableColumns } from "./_components/table-columns";

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
      // Se médico não está vinculado, redirecionar
      redirect("/unauthorized");
    }

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

  const [patients, doctors, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: patientsFilter,
    }),
    db.query.doctorsTable.findMany({
      where: doctorsFilter,
    }),
    db.query.appointmentsTable.findMany({
      where: appointmentsFilter,
      with: {
        patient: true,
        doctor: true,
      },
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            Gerencie os agendamentos da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentButton patients={patients} doctors={doctors} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <DataTable data={appointments} columns={appointmentsTableColumns} />
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;
