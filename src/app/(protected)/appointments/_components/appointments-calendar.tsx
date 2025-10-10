"use client";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getAvailableTimes } from "@/actions/get-available-times";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { getSpecialtyLabel } from "../../doctors/_constants";
import { DayDetailsModal } from "./day-details-modal";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("pt-br");

// Função para formatar telefone
const formatPhoneNumber = (phone: string) => {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

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
  isReturn: boolean;
  patient: {
    name: string;
    phoneNumber: string;
  };
  doctor: {
    id: string;
    name: string;
  };
}

interface AppointmentsCalendarProps {
  doctors: Doctor[];
  appointments: Appointment[];
  userRole: "admin" | "doctor";
}

export function AppointmentsCalendar({
  doctors,
  appointments,
  userRole,
}: AppointmentsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<
    Record<string, string[]>
  >({});
  const [selectedDay, setSelectedDay] = useState<dayjs.Dayjs | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar médicos baseado no role do usuário
  const filteredDoctors = userRole === "admin" ? doctors : doctors;

  // Selecionar automaticamente o primeiro médico se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedDoctor && filteredDoctors.length > 0) {
      setSelectedDoctor(filteredDoctors[0].id);
    }
  }, [selectedDoctor, filteredDoctors]);

  // Carregar horários disponíveis para o médico selecionado
  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (!selectedDoctor) return;

      const times: Record<string, string[]> = {};

      try {
        // Carregar horários para todo o mês atual
        const startOfMonth = currentDate.startOf("month");
        const endOfMonth = currentDate.endOf("month");
        const daysInMonth = endOfMonth.diff(startOfMonth, "day") + 1;

        for (let i = 0; i < daysInMonth; i++) {
          const date = startOfMonth.add(i, "day");
          try {
            const availableTimesForDate = await getAvailableTimes({
              doctorId: selectedDoctor,
              date: date.format("YYYY-MM-DD"),
            });

            // Extrair horários disponíveis do resultado
            let availableTimeStrings: string[] = [];
            if (
              availableTimesForDate?.data &&
              Array.isArray(availableTimesForDate.data)
            ) {
              availableTimeStrings = availableTimesForDate.data
                .filter((item) => item.available)
                .map((item) => item.value);
            } else if (Array.isArray(availableTimesForDate)) {
              availableTimeStrings = availableTimesForDate
                .filter((item) => item.available)
                .map((item) => item.value);
            }

            times[date.format("YYYY-MM-DD")] = availableTimeStrings;
          } catch (error) {
            console.error(
              "Erro ao carregar horários para data específica:",
              date.format("YYYY-MM-DD"),
              error,
            );
            times[date.format("YYYY-MM-DD")] = [];
          }
        }
      } catch (error) {
        console.error("Erro geral ao carregar horários disponíveis:", error);
      } finally {
        setAvailableTimes(times);
      }
    };

    loadAvailableTimes();
  }, [selectedDoctor, currentDate]);

  // Obter agendamentos para uma data específica
  const getAppointmentsForDate = (date: string) => {
    return appointments.filter((appointment) => {
      try {
        // Converter de UTC para horário local do Brasil para comparação
        const appointmentDate = dayjs(appointment.date)
          .utc()
          .tz("America/Sao_Paulo");
        const targetDate = dayjs(date);

        // Verificar se a data do agendamento corresponde à data alvo
        const matchesDate =
          appointmentDate.format("YYYY-MM-DD") ===
          targetDate.format("YYYY-MM-DD");
        const matchesDoctor = appointment.doctor.id === selectedDoctor;

        return matchesDate && matchesDoctor;
      } catch (error) {
        console.error(
          "Erro ao processar data do agendamento:",
          error,
          appointment,
        );
        return false;
      }
    });
  };

  // Gerar dias do mês
  const generateCalendarDays = () => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const startOfCalendar = startOfMonth.startOf("week");
    const endOfCalendar = endOfMonth.endOf("week");

    const days = [];
    let currentDay = startOfCalendar;

    while (
      currentDay.isBefore(endOfCalendar) ||
      currentDay.isSame(endOfCalendar, "day")
    ) {
      days.push(currentDay);
      currentDay = currentDay.add(1, "day");
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDayClick = (day: dayjs.Dayjs) => {
    if (selectedDoctor) {
      setSelectedDay(day);
      setIsModalOpen(true);
    }
  };

  const selectedDoctorData = filteredDoctors.find(
    (d) => d.id === selectedDoctor,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário de Agendamentos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar médico" />
              </SelectTrigger>
              <SelectContent>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {getSpecialtyLabel(doctor.specialty)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Navegação do calendário */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {currentDate.format("MMMM [de] YYYY")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(currentDate.add(1, "month"))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-muted-foreground p-2 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do calendário */}
        <div className="grid grid-cols-7 gap-3">
          {calendarDays.map((day) => {
            const dateStr = day.format("YYYY-MM-DD");
            const dayAppointments = getAppointmentsForDate(dateStr);
            const isCurrentMonth = day.isSame(currentDate, "month");
            const isToday = day.isSame(dayjs(), "day");
            const isPast = day.isBefore(dayjs(), "day");
            const hasAvailableSlots =
              availableTimes[dateStr] && availableTimes[dateStr].length > 0;

            return (
              <div
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "group relative flex min-h-[140px] cursor-pointer flex-col overflow-hidden rounded-xl border-2 p-3 text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-xl",
                  !isCurrentMonth &&
                    "text-muted-foreground bg-muted/20 border-muted/30",
                  isCurrentMonth &&
                    !isToday &&
                    "bg-background border-border hover:border-primary/60",
                  isToday &&
                    "from-primary/10 to-primary/5 border-primary ring-primary/20 bg-gradient-to-br shadow-lg ring-2",
                  isPast && "opacity-70",
                  dayAppointments.length > 0 &&
                    "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/30",
                  hasAvailableSlots &&
                    dayAppointments.length === 0 &&
                    "border-green-300 bg-gradient-to-br from-green-50 to-green-100/30",
                )}
              >
                {/* Header do dia */}
                <div className="mb-2 flex items-start justify-between">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-base font-bold transition-colors",
                      isToday && "bg-primary text-primary-foreground shadow-md",
                      isCurrentMonth &&
                        !isToday &&
                        "text-foreground group-hover:bg-primary/10",
                      !isCurrentMonth && "text-muted-foreground",
                    )}
                  >
                    {day.format("D")}
                  </div>

                  {/* Badge de quantidade */}
                  {dayAppointments.length > 0 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white shadow-md">
                      {dayAppointments.length}
                    </div>
                  )}
                </div>

                {/* Indicadores de status */}
                <div className="mb-2 flex-1 space-y-1.5">
                  {/* Horários disponíveis */}
                  {hasAvailableSlots && (
                    <div className="flex items-center gap-1.5 rounded-md bg-green-100/80 px-2 py-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-sm"></div>
                      <span className="text-xs font-semibold text-green-700">
                        Horários disponíveis
                      </span>
                    </div>
                  )}

                  {/* Agendamentos confirmados */}
                  {dayAppointments.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-md bg-blue-100/80 px-2 py-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shadow-sm"></div>
                      <span className="text-xs font-semibold text-blue-700">
                        {dayAppointments.length} agendado
                        {dayAppointments.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Sem disponibilidade */}
                  {!hasAvailableSlots &&
                    dayAppointments.length === 0 &&
                    isCurrentMonth && (
                      <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1">
                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        <span className="text-xs font-medium text-gray-600">
                          Sem horários
                        </span>
                      </div>
                    )}
                </div>

                {/* Preview de agendamentos */}
                {dayAppointments.length > 0 && (
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="truncate rounded-lg border border-blue-300 bg-white/90 px-2 py-1.5 text-xs shadow-sm backdrop-blur-sm transition-all hover:bg-white"
                        title={`${dayjs(appointment.date).utc().tz("America/Sao_Paulo").format("HH:mm")} - ${appointment.patient.name} ${formatPhoneNumber(appointment.patient.phoneNumber)} ${Boolean(appointment.isReturn) ? "(Retorno)" : ""}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-700">
                            {dayjs(appointment.date)
                              .utc()
                              .tz("America/Sao_Paulo")
                              .format("HH:mm")}
                          </span>
                          {Boolean(appointment.isReturn) && (
                            <span className="rounded-full bg-purple-100 px-1.5 text-[10px] font-medium text-purple-700">
                              R
                            </span>
                          )}
                        </div>
                        <div className="truncate font-medium text-blue-900">
                          {appointment.patient.name}
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 p-1.5 text-center text-[11px] font-bold text-blue-700 shadow-sm">
                        +{dayAppointments.length - 2} agendamento
                        {dayAppointments.length - 2 > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}

                {/* Indicador de hover */}
                <div className="group-hover:from-primary/5 group-hover:to-primary/10 pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            );
          })}
        </div>

        {/* Legenda melhorada */}
        <div className="from-muted/30 to-muted/10 mt-6 rounded-xl border bg-gradient-to-br p-5 shadow-sm">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <div className="bg-primary h-1 w-1 rounded-full"></div>
            Legenda do Calendário
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Status dos dias */}
            <div className="space-y-3">
              <h5 className="text-muted-foreground text-xs font-semibold uppercase">
                Status dos Dias
              </h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold shadow-md">
                    {dayjs().format("D")}
                  </div>
                  <span className="text-sm">Hoje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100/30"></div>
                  <span className="text-sm">Com horários disponíveis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/30"></div>
                  <span className="text-sm">Com agendamentos</span>
                </div>
              </div>
            </div>

            {/* Indicadores */}
            <div className="space-y-3">
              <h5 className="text-muted-foreground text-xs font-semibold uppercase">
                Indicadores
              </h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-md bg-green-100/80 px-2 py-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-xs font-semibold text-green-700">
                      Horários disponíveis
                    </span>
                  </div>
                  <span className="text-sm">Horários livres</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-md bg-blue-100/80 px-2 py-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-semibold text-blue-700">
                      Agendados
                    </span>
                  </div>
                  <span className="text-sm">Confirmados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white shadow-md">
                    5
                  </div>
                  <span className="text-sm">Total de agendamentos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modal de detalhes do dia */}
      <DayDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDay}
        doctor={selectedDoctorData || null}
        appointments={appointments}
        userRole={userRole}
      />
    </Card>
  );
}
