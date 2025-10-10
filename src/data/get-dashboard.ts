import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { unstable_cache } from "next/cache";

dayjs.extend(utc);
dayjs.extend(timezone);

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

interface Params {
  from: string;
  to: string;
  session: {
    user: {
      clinic: {
        id: string;
      };
    };
  };
}

// Cache da função getDashboard (revalidar a cada 5 minutos)
const getCachedDashboardData = unstable_cache(
  async (clinicId: string, from: string, to: string) => {
    const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
    const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();

    return await Promise.all([
      db
        .select({
          total: sum(appointmentsTable.appointmentPriceInCents),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, clinicId),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, clinicId),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(patientsTable)
        .where(eq(patientsTable.clinicId, clinicId)),
      db
        .select({
          total: count(),
        })
        .from(doctorsTable)
        .where(eq(doctorsTable.clinicId, clinicId)),
      db
        .select({
          id: doctorsTable.id,
          name: doctorsTable.name,
          avatarImageUrl: doctorsTable.avatarImageUrl,
          specialty: doctorsTable.specialty,
          appointments: count(appointmentsTable.id),
        })
        .from(doctorsTable)
        .leftJoin(
          appointmentsTable,
          and(
            eq(appointmentsTable.doctorId, doctorsTable.id),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        )
        .where(eq(doctorsTable.clinicId, clinicId))
        .groupBy(doctorsTable.id)
        .orderBy(desc(count(appointmentsTable.id)))
        .limit(10),
      db
        .select({
          specialty: doctorsTable.specialty,
          appointments: count(appointmentsTable.id),
        })
        .from(appointmentsTable)
        .innerJoin(
          doctorsTable,
          eq(appointmentsTable.doctorId, doctorsTable.id),
        )
        .where(
          and(
            eq(appointmentsTable.clinicId, clinicId),
            gte(appointmentsTable.date, new Date(from)),
            lte(appointmentsTable.date, new Date(to)),
          ),
        )
        .groupBy(doctorsTable.specialty)
        .orderBy(desc(count(appointmentsTable.id))),
      db.query.appointmentsTable.findMany({
        where: and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, dayjs().startOf("day").utc().toDate()),
          lte(appointmentsTable.date, dayjs().endOf("day").utc().toDate()),
        ),
        with: {
          patient: true,
          doctor: true,
        },
      }),
      db
        .select({
          date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
          appointments: count(appointmentsTable.id),
          revenue:
            sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as(
              "revenue",
            ),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, clinicId),
            gte(appointmentsTable.date, chartStartDate),
            lte(appointmentsTable.date, chartEndDate),
          ),
        )
        .groupBy(sql`DATE(${appointmentsTable.date})`)
        .orderBy(sql`DATE(${appointmentsTable.date})`),
    ]);
  },
  ["dashboard-data"],
  {
    revalidate: 300, // 5 minutos
    tags: ["dashboard-data"],
  },
);

export const getDashboard = async ({ from, to, session }: Params) => {
  // Usar cache para dados do dashboard
  const [
    [totalRevenue],
    [totalAppointments],
    [totalPatients],
    [totalDoctors],
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  ] = await getCachedDashboardData(session.user.clinic.id, from, to);
  return {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  };
};
