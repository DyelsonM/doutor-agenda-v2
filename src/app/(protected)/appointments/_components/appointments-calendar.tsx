"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
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
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { getAvailableTimes } from "@/actions/get-available-times";
import { getSpecialtyLabel } from "../../doctors/_constants";
import { cn } from "@/lib/utils";
import { DayDetailsModal } from "./day-details-modal";

dayjs.extend(utc);
dayjs.extend(timezone);
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
  isReturn: boolean;
  patient: {
    name: string;
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
        // Carregar horários para os próximos 7 dias
        for (let i = 0; i < 7; i++) {
          const date = currentDate.add(i, "day");
          try {
            const availableTimesForDate = await getAvailableTimes({
              doctorId: selectedDoctor,
              date: date.format("YYYY-MM-DD"),
            });
            // Garantir que sempre temos um array e extrair apenas os horários disponíveis
            const availableTimeStrings = Array.isArray(availableTimesForDate)
              ? availableTimesForDate
                  .filter((item) => item.available)
                  .map((item) => item.value)
              : [];
            times[date.format("YYYY-MM-DD")] = availableTimeStrings;
          } catch (error) {
            console.error(
              "Erro ao carregar horários para data específica:",
              date.format("YYYY-MM-DD"),
              error,
            );
            // Se o erro for de permissão, mostrar mensagem mais amigável
            if (
              error instanceof Error &&
              error.message.includes("Acesso negado")
            ) {
              console.warn(
                "Usuário não tem permissão para ver agendamentos deste médico",
              );
            }
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

  // Verificar se um médico está disponível em um dia específico
  const isDoctorAvailableOnDate = (doctor: Doctor, date: dayjs.Dayjs) => {
    const dayOfWeek = date.day();
    return (
      dayOfWeek >= doctor.availableFromWeekDay &&
      dayOfWeek <= doctor.availableToWeekDay
    );
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
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dateStr = day.format("YYYY-MM-DD");
            const dayAppointments = getAppointmentsForDate(dateStr);
            const isCurrentMonth = day.isSame(currentDate, "month");
            const isToday = day.isSame(dayjs(), "day");
            const isPast = day.isBefore(dayjs(), "day");

            // Verificar disponibilidade dos médicos para este dia
            const availableDoctors = filteredDoctors.filter((doctor) =>
              isDoctorAvailableOnDate(doctor, day),
            );

            return (
              <div
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "hover:bg-muted/50 min-h-[100px] cursor-pointer rounded-lg border p-2 text-sm transition-colors",
                  !isCurrentMonth && "text-muted-foreground bg-muted/20",
                  isToday && "bg-primary/10 border-primary",
                  isPast && "opacity-50",
                  selectedDoctor && "hover:shadow-md",
                )}
              >
                <div className="mb-1 font-medium">{day.format("D")}</div>

                {/* Indicador de disponibilidade */}
                {selectedDoctor && (
                  <div className="space-y-1">
                    {loading ? (
                      <div className="text-muted-foreground text-xs">
                        Carregando...
                      </div>
                    ) : (
                      <>
                        {availableTimes[dateStr] &&
                          availableTimes[dateStr].length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {availableTimes[dateStr].length} horários
                            </Badge>
                          )}
                        {dayAppointments.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {dayAppointments.length} agendado(s)
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Listar agendamentos do dia */}
                {dayAppointments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-primary/10 truncate rounded p-1 text-xs"
                        title={`${dayjs(appointment.date).utc().tz("America/Sao_Paulo").format("HH:mm")} - ${appointment.patient.name} ${Boolean(appointment.isReturn) ? "(Retorno)" : ""}`}
                      >
                        {dayjs(appointment.date)
                          .utc()
                          .tz("America/Sao_Paulo")
                          .format("HH:mm")}{" "}
                        - {appointment.patient.name}
                        {Boolean(appointment.isReturn) && (
                          <span className="text-primary ml-1 font-medium">
                            (R)
                          </span>
                        )}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-muted-foreground text-xs">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 border-primary h-3 w-3 rounded border"></div>
            Hoje
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Horários
            </Badge>
            Disponíveis
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              Agendados
            </Badge>
            Confirmados
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
      />
    </Card>
  );
}
