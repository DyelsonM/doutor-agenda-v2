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
  const [loading, setLoading] = useState(false);
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

      setLoading(true);
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
        setLoading(false);
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
        <div className="grid grid-cols-7 gap-2">
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
                  "group relative min-h-[120px] cursor-pointer rounded-lg border-2 p-3 text-sm transition-all duration-200 hover:shadow-lg",
                  !isCurrentMonth &&
                    "text-muted-foreground bg-muted/20 border-muted/30",
                  isCurrentMonth &&
                    !isToday &&
                    "bg-background border-border hover:border-primary/50",
                  isToday && "bg-primary/5 border-primary shadow-md",
                  isPast && "opacity-60",
                  dayAppointments.length > 0 && "border-blue-200 bg-blue-50/50",
                  hasAvailableSlots &&
                    dayAppointments.length === 0 &&
                    "border-green-200 bg-green-50/50",
                )}
              >
                {/* Número do dia */}
                <div
                  className={cn(
                    "mb-2 text-base font-semibold",
                    isToday && "text-primary",
                    isCurrentMonth && !isToday && "text-foreground",
                    !isCurrentMonth && "text-muted-foreground",
                  )}
                >
                  {day.format("D")}
                </div>

                {/* Indicadores de status */}
                <div className="space-y-1">
                  {loading ? (
                    <div className="text-muted-foreground animate-pulse text-xs">
                      Carregando...
                    </div>
                  ) : (
                    <>
                      {/* Horários disponíveis */}
                      {hasAvailableSlots && (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs font-medium text-green-700">
                            {availableTimes[dateStr].length} horários
                          </span>
                        </div>
                      )}

                      {/* Agendamentos confirmados */}
                      {dayAppointments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs font-medium text-blue-700">
                            {dayAppointments.length} agendado(s)
                          </span>
                        </div>
                      )}

                      {/* Sem disponibilidade */}
                      {!hasAvailableSlots &&
                        dayAppointments.length === 0 &&
                        isCurrentMonth && (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                            <span className="text-xs text-gray-500">
                              Sem horários
                            </span>
                          </div>
                        )}
                    </>
                  )}
                </div>

                {/* Lista de agendamentos (mais visível) */}
                {dayAppointments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="truncate rounded-md border border-blue-200 bg-blue-100 p-2 text-xs shadow-sm"
                        title={`${dayjs(appointment.date).utc().tz("America/Sao_Paulo").format("HH:mm")} - ${appointment.patient.name} ${formatPhoneNumber(appointment.patient.phoneNumber)} ${Boolean(appointment.isReturn) ? "(Retorno)" : ""}`}
                      >
                        <div className="font-medium text-blue-800">
                          {dayjs(appointment.date)
                            .utc()
                            .tz("America/Sao_Paulo")
                            .format("HH:mm")}
                        </div>
                        <div className="truncate text-blue-700">
                          {appointment.patient.name}
                        </div>
                        {Boolean(appointment.isReturn) && (
                          <div className="text-xs font-medium text-blue-600">
                            Retorno
                          </div>
                        )}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="rounded-md bg-blue-50 p-1 text-center text-xs font-medium text-blue-600">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                )}

                {/* Indicador de clique */}
                <div className="group-hover:bg-primary/5 pointer-events-none absolute inset-0 rounded-lg bg-transparent transition-colors" />
              </div>
            );
          })}
        </div>

        {/* Legenda melhorada */}
        <div className="bg-muted/30 mt-6 rounded-lg p-4">
          <h4 className="mb-3 text-sm font-medium">Legenda</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="border-primary bg-primary/5 h-3 w-3 rounded border-2"></div>
                <span className="text-muted-foreground">Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">
                  Horários disponíveis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">
                  Agendamentos confirmados
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                <span className="text-muted-foreground">
                  Sem horários disponíveis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded border border-blue-200 bg-blue-100"></div>
                <span className="text-muted-foreground">
                  Card de agendamento
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-blue-50"></div>
                <span className="text-muted-foreground">
                  Dia com agendamentos
                </span>
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
