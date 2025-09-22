"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Calendar, Clock } from "lucide-react";
import { AppointmentsTableClient } from "./appointments-table-client";
import { AppointmentsCalendar } from "./appointments-calendar";
import { WeeklySchedule } from "./weekly-schedule";

interface AppointmentsViewProps {
  appointments: any[];
  doctors: any[];
  patients: any[];
  userRole: "admin" | "doctor";
}

export function AppointmentsView({
  appointments,
  doctors,
  patients,
  userRole,
}: AppointmentsViewProps) {
  return (
    <Tabs defaultValue="table" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          Lista
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendário
        </TabsTrigger>
        <TabsTrigger value="weekly" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Semanal
        </TabsTrigger>
      </TabsList>

      <TabsContent value="table" className="mt-6">
        <AppointmentsTableClient
          appointments={appointments}
          userRole={userRole}
        />
      </TabsContent>

      <TabsContent value="calendar" className="mt-6">
        <AppointmentsCalendar
          doctors={doctors}
          appointments={appointments}
          userRole={userRole}
        />
      </TabsContent>

      <TabsContent value="weekly" className="mt-6">
        <WeeklySchedule
          doctors={doctors}
          appointments={appointments}
          userRole={userRole}
        />
      </TabsContent>
    </Tabs>
  );
}
