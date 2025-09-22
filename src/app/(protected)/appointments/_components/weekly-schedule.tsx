"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getAvailableTimes } from "@/actions/get-available-times";
import { cn } from "@/lib/utils";

dayjs.locale("pt-br");

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availableFromWeekDay: number;
  availableToWeekDay: number;
  availableFromTime: string;
  availableToTime: string;
}

interface Appointment {
  id: string;
  date: string;
  patient: {
    name: string;
  };
  doctor: {
    id: string;
    name: string;
  };
}

interface WeeklyScheduleProps {
  doctors: Doctor[];
  appointments: Appointment[];
  userRole: "admin" | "doctor";
}

export function WeeklySchedule({
  doctors,
  appointments,
  userRole,
}: WeeklyScheduleProps) {
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [weeklyData, setWeeklyData] = useState<
    Record<string, Record<string, string[]>>
  >({});
  const [loading, setLoading] = useState(false);

  // Filtrar médicos baseado no role do usuário
  const filteredDoctors = userRole === "admin" ? doctors : doctors;

  // Carregar dados da semana
  useEffect(() => {
    if (selectedDoctor === "all") return;

    loadWeeklyData();
  }, [selectedDoctor, currentWeek]);

  const loadWeeklyData = async () => {
    if (!selectedDoctor || selectedDoctor === "all") return;

    setLoading(true);
    const data: Record<string, Record<string, string[]>> = {};

    // Carregar dados para os próximos 7 dias
    for (let i = 0; i < 7; i++) {
      const date = currentWeek.add(i, "day");
      const dateStr = date.format("YYYY-MM-DD");

      try {
        const availableTimes = await getAvailableTimes({
          doctorId: selectedDoctor,
          date: dateStr,
        });
        data[dateStr] = { available: availableTimes };
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
        data[dateStr] = { available: [] };
      }
    }

    setWeeklyData(data);
    setLoading(false);
  };

  // Obter agendamentos para uma data específica
  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(
      (appointment) =>
        dayjs(appointment.date).format("YYYY-MM-DD") === date &&
        (selectedDoctor === "all" || appointment.doctor.id === selectedDoctor),
    );
  };

  // Verificar se um médico está disponível em um dia específico
  const isDoctorAvailableOnDate = (doctor: Doctor, date: dayjs.Dayjs) => {
    const dayOfWeek = date.day();
    return (
      dayOfWeek >= doctor.availableFromWeekDay &&
      dayOfWeek <= doctor.availableToWeekDay
    );
  };

  // Gerar dias da semana
  const generateWeekDays = () => {
    const startOfWeek = currentWeek.startOf("week");
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.add(i, "day"));
    }

    return days;
  };

  const weekDays = generateWeekDays();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agenda Semanal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os médicos</SelectItem>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Navegação da semana */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(currentWeek.subtract(1, "week"))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            Semana de {currentWeek.startOf("week").format("DD/MM")} a{" "}
            {currentWeek.endOf("week").format("DD/MM")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(currentWeek.add(1, "week"))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Grade semanal */}
        <div className="space-y-4">
          {weekDays.map((day) => {
            const dateStr = day.format("YYYY-MM-DD");
            const dayAppointments = getAppointmentsForDate(dateStr);
            const isToday = day.isSame(dayjs(), "day");
            const isPast = day.isBefore(dayjs(), "day");

            return (
              <div
                key={dateStr}
                className={cn(
                  "rounded-lg border p-4",
                  isToday && "bg-primary/5 border-primary",
                  isPast && "opacity-60",
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {day.format("dddd, DD/MM")}
                    </h4>
                    {isToday && (
                      <Badge variant="default" className="mt-1">
                        Hoje
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {dayAppointments.length} agendamento(s)
                  </div>
                </div>

                {/* Mostrar médicos disponíveis quando "todos" está selecionado */}
                {selectedDoctor === "all" ? (
                  <div className="space-y-3">
                    {filteredDoctors.map((doctor) => {
                      const doctorAppointments = dayAppointments.filter(
                        (apt) => apt.doctor.id === doctor.id,
                      );
                      const isAvailable = isDoctorAvailableOnDate(doctor, day);

                      return (
                        <div
                          key={doctor.id}
                          className={cn(
                            "rounded-lg border p-3",
                            isAvailable
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-gray-50",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{doctor.name}</div>
                              <div className="text-muted-foreground text-sm">
                                {doctor.specialty}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={isAvailable ? "default" : "secondary"}
                                className={cn(
                                  isAvailable
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800",
                                )}
                              >
                                {isAvailable ? "Disponível" : "Indisponível"}
                              </Badge>
                              {doctorAppointments.length > 0 && (
                                <Badge variant="outline">
                                  {doctorAppointments.length} agendado(s)
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Listar agendamentos do médico */}
                          {doctorAppointments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {doctorAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="rounded border bg-white p-2 text-sm"
                                >
                                  {dayjs(appointment.date).format("HH:mm")} -{" "}
                                  {appointment.patient.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Mostrar horários disponíveis quando médico específico está selecionado */
                  <div>
                    {loading ? (
                      <div className="py-4 text-center">
                        Carregando horários...
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-2">
                        {weeklyData[dateStr]?.available?.map((time) => {
                          const isBooked = dayAppointments.some(
                            (apt) =>
                              dayjs(apt.date).format("HH:mm") ===
                              time.split(":")[0] + ":" + time.split(":")[1],
                          );

                          return (
                            <Button
                              key={time}
                              variant={isBooked ? "outline" : "default"}
                              size="sm"
                              disabled={isBooked}
                              className={cn(
                                isBooked && "cursor-not-allowed opacity-50",
                              )}
                            >
                              {time.split(":")[0]}:{time.split(":")[1]}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
