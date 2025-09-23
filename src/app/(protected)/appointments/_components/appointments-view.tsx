"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Calendar } from "lucide-react";
import { AppointmentsTableClient } from "./appointments-table-client";
import { AppointmentsCalendar } from "./appointments-calendar";

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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          Lista
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendário
        </TabsTrigger>
      </TabsList>

      <TabsContent value="table" className="mt-6">
        <AppointmentsTableClient
          appointments={appointments}
          userRole={userRole}
          patients={patients}
          doctors={doctors}
        />
      </TabsContent>

      <TabsContent value="calendar" className="mt-6">
        <AppointmentsCalendar
          doctors={doctors}
          appointments={appointments}
          userRole={userRole}
        />
      </TabsContent>
    </Tabs>
  );
}
