"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, User, Calendar } from "lucide-react";
import { getAvailableTimes } from "@/actions/get-available-times";
import { getSpecialtyLabel } from "../../doctors/_constants";
import { cn } from "@/lib/utils";

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
  patient: {
    name: string;
  };
  doctor: {
    id: string;
    name: string;
  };
}

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: dayjs.Dayjs | null;
  doctor: Doctor | null;
  appointments: Appointment[];
}

export function DayDetailsModal({
  isOpen,
  onClose,
  selectedDate,
  doctor,
  appointments,
}: DayDetailsModalProps) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedDate && doctor) {
      loadAvailableTimes();
    }
  }, [isOpen, selectedDate, doctor]);

  const loadAvailableTimes = async () => {
    if (!selectedDate || !doctor) return;

    setLoading(true);
    try {
      const times = await getAvailableTimes({
        doctorId: doctor.id,
        date: selectedDate.format("YYYY-MM-DD"),
      });
      setAvailableTimes(times);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDate || !doctor) return null;

  const dayAppointments = appointments.filter((appointment) => {
    try {
      // Converter de UTC para horário local do Brasil para comparação
      const appointmentDate = dayjs(appointment.date)
        .utc()
        .tz("America/Sao_Paulo");
      const targetDate = dayjs(selectedDate);

      return (
        appointmentDate.format("YYYY-MM-DD") ===
          targetDate.format("YYYY-MM-DD") && appointment.doctor.id === doctor.id
      );
    } catch (error) {
      console.error(
        "Erro ao processar data do agendamento:",
        error,
        appointment,
      );
      return false;
    }
  });

  const isDoctorAvailable = () => {
    const dayOfWeek = selectedDate.day();
    return (
      dayOfWeek >= doctor.availableFromWeekDay &&
      dayOfWeek <= doctor.availableToWeekDay
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {selectedDate.format("dddd, DD [de] MMMM [de] YYYY")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do médico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {doctor.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Especialidade:</span>{" "}
                  {getSpecialtyLabel(doctor.specialty)}
                </div>
                <div>
                  <span className="font-medium">Horário de funcionamento:</span>{" "}
                  {doctor.availableFromTime} às {doctor.availableToTime}
                </div>
                <div>
                  <span className="font-medium">Dias da semana:</span>{" "}
                  {getWeekDaysText(
                    doctor.availableFromWeekDay,
                    doctor.availableToWeekDay,
                  )}
                </div>
                <div className="mt-2">
                  <Badge
                    variant={isDoctorAvailable() ? "default" : "secondary"}
                    className={cn(
                      isDoctorAvailable()
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800",
                    )}
                  >
                    {isDoctorAvailable() ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horários disponíveis */}
          {isDoctorAvailable() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horários Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-4 text-center">Carregando horários...</div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimes.map((time) => {
                      const isBooked = dayAppointments.some((apt) => {
                        try {
                          return (
                            dayjs(apt.date)
                              .utc()
                              .tz("America/Sao_Paulo")
                              .format("HH:mm") ===
                            time.split(":")[0] + ":" + time.split(":")[1]
                          );
                        } catch (error) {
                          console.error(
                            "Erro ao processar horário do agendamento:",
                            error,
                            apt,
                          );
                          return false;
                        }
                      });

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
              </CardContent>
            </Card>
          )}

          {/* Agendamentos do dia */}
          {dayAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos Confirmados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-muted flex items-center justify-between rounded-lg p-3"
                    >
                      <div>
                        <div className="font-medium">
                          {dayjs(appointment.date)
                            .utc()
                            .tz("America/Sao_Paulo")
                            .format("HH:mm")}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {appointment.patient.name}
                        </div>
                      </div>
                      <Badge variant="secondary">Confirmado</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getWeekDaysText(fromDay: number, toDay: number): string {
  const days = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  if (fromDay === toDay) {
    return days[fromDay];
  }

  return `${days[fromDay]} a ${days[toDay]}`;
}
