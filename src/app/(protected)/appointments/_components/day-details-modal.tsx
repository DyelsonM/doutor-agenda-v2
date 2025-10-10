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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  User,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteAppointment } from "@/actions/delete-appointment";
import { getAvailableTimes } from "@/actions/get-available-times";
import { getSpecialtyLabel } from "../../doctors/_constants";
import { cn } from "@/lib/utils";

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

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: dayjs.Dayjs | null;
  doctor: Doctor | null;
  appointments: Appointment[];
  userRole: "admin" | "doctor";
}

export function DayDetailsModal({
  isOpen,
  onClose,
  selectedDate,
  doctor,
  appointments,
  userRole,
}: DayDetailsModalProps) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Agendamento deletado com sucesso.");
      // Recarregar os horários disponíveis e manter o modal aberto
      loadAvailableTimes();
    },
    onError: () => {
      toast.error("Erro ao deletar agendamento.");
    },
  });

  const handleDeleteAppointment = (appointmentId: string) => {
    deleteAppointmentAction.execute({ id: appointmentId });
  };

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
      // Garantir que sempre temos um array e extrair apenas os horários disponíveis
      const availableTimeStrings = Array.isArray(times)
        ? times.filter((item) => item.available).map((item) => item.value)
        : [];
      setAvailableTimes(availableTimeStrings);
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
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {selectedDate.format("dddd, DD [de] MMMM [de] YYYY")}
          </DialogTitle>
          <DialogDescription>
            Detalhes dos agendamentos e horários disponíveis para {doctor.name}{" "}
            neste dia.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-120px)] space-y-4 overflow-y-auto pr-2">
          {/* Informações do médico */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                {doctor.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Especialidade:</span>
                  <span className="font-medium">
                    {getSpecialtyLabel(doctor.specialty)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Horário de funcionamento:
                  </span>
                  <span className="font-medium">
                    {doctor.availableFromTime} às {doctor.availableToTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dias da semana:</span>
                  <span className="font-medium">
                    {getWeekDaysText(
                      doctor.availableFromWeekDay,
                      doctor.availableToWeekDay,
                    )}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
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

          {/* Horários disponíveis - só aparece se houver horários */}
          {isDoctorAvailable() && !loading && availableTimes.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horários Disponíveis
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    {availableTimes.length} horário(s) disponível(is)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-5 gap-2">
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
                          "text-xs",
                          isBooked && "cursor-not-allowed opacity-50",
                        )}
                      >
                        {time.split(":")[0]}:{time.split(":")[1]}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading dos horários */}
          {isDoctorAvailable() && loading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-muted-foreground text-center text-sm">
                  Carregando horários disponíveis...
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agendamentos do dia */}
          {dayAppointments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Agendamentos Confirmados</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {dayAppointments.length} agendamento(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
                  {dayAppointments
                    .sort((a, b) => {
                      const timeA = dayjs(a.date).utc().tz("America/Sao_Paulo");
                      const timeB = dayjs(b.date).utc().tz("America/Sao_Paulo");
                      return timeA.diff(timeB);
                    })
                    .map((appointment, index) => (
                      <div
                        key={appointment.id}
                        className="bg-muted flex items-start justify-between rounded-lg border border-blue-100 p-3 transition-shadow hover:shadow-md"
                      >
                        <div className="flex flex-1 gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-semibold text-blue-700">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-blue-600" />
                              <span className="font-semibold text-blue-900">
                                {dayjs(appointment.date)
                                  .utc()
                                  .tz("America/Sao_Paulo")
                                  .format("HH:mm")}
                              </span>
                              {Boolean(appointment.isReturn) && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-xs text-purple-700"
                                >
                                  Retorno
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm">
                              <div className="font-medium">
                                {appointment.patient.name}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {formatPhoneNumber(
                                  appointment.patient.phoneNumber,
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Confirmado
                          </Badge>
                          {userRole === "admin" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  {appointment.patient.name}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Tem certeza que deseja deletar esse
                                        agendamento?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Essa ação não pode ser revertida. Isso
                                        irá deletar o agendamento de{" "}
                                        <strong>
                                          {appointment.patient.name}
                                        </strong>{" "}
                                        permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteAppointment(
                                            appointment.id,
                                          )
                                        }
                                        disabled={
                                          deleteAppointmentAction.isPending
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {deleteAppointmentAction.isPending
                                          ? "Deletando..."
                                          : "Deletar"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensagem quando não há agendamentos */}
          {dayAppointments.length === 0 && isDoctorAvailable() && (
            <Card>
              <CardContent className="py-8">
                <div className="text-muted-foreground text-center text-sm">
                  Nenhum agendamento confirmado para este dia
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
