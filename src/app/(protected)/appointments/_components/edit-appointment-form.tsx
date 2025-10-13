"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { updateAppointment } from "@/actions/update-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

import { getSpecialtyLabel } from "../../doctors/_constants";
import { getAppointmentModalitiesByCategory } from "@/actions/get-appointment-modalities-by-category";

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Médico é obrigatório.",
  }),
  appointmentPrice: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  modality: z.string().min(1, {
    message: "Modalidade é obrigatória.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
  isReturn: z.boolean().default(false),
});

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
};

interface EditAppointmentFormProps {
  isOpen: boolean;
  appointment: AppointmentWithRelations;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const EditAppointmentForm = ({
  appointment,
  patients,
  doctors,
  onSuccess,
  isOpen,
}: EditAppointmentFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: false, // Mudado para false para manter os valores
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: appointment.patient.id,
      doctorId: appointment.doctor.id,
      appointmentPrice: appointment.appointmentPriceInCents / 100,
      modality: appointment.modality || "",
      date: dayjs(appointment.date).utc().tz("America/Sao_Paulo").toDate(),
      time: dayjs(appointment.date)
        .utc()
        .tz("America/Sao_Paulo")
        .format("HH:mm"),
      isReturn: appointment.isReturn || false,
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedPatientId = form.watch("patientId");
  const selectedDate = form.watch("date");

  // Gerar horários disponíveis de 5 em 5 minutos baseado no horário de trabalho do médico
  const generateTimeSlots = () => {
    if (!selectedDoctorId) return [];

    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!doctor) return [];

    const slots: string[] = [];
    const [startHour, startMinute] = doctor.availableFromTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = doctor.availableToTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
      slots.push(timeString);

      currentMinute += 5;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const availableTimeSlots = generateTimeSlots();

  const { data: appointmentModalitiesByCategory } = useQuery({
    queryKey: ["appointment-modalities-by-category"],
    queryFn: getAppointmentModalitiesByCategory,
  });

  // Atualizar o preço quando o médico for selecionado (apenas se o preço atual for 0 ou se o médico mudou)
  useEffect(() => {
    if (selectedDoctorId) {
      const selectedDoctor = doctors.find(
        (doctor) => doctor.id === selectedDoctorId,
      );
      if (selectedDoctor) {
        const currentPrice = form.getValues("appointmentPrice");
        const originalDoctorId = appointment.doctor.id;

        // Só atualiza o preço automaticamente se:
        // 1. O preço atual for 0, OU
        // 2. O médico foi alterado (diferente do original)
        if (currentPrice === 0 || selectedDoctorId !== originalDoctorId) {
          form.setValue(
            "appointmentPrice",
            selectedDoctor.appointmentPriceInCents / 100,
          );
        }
      }
    }
  }, [selectedDoctorId, doctors, form, appointment.doctor.id]);

  useEffect(() => {
    if (isOpen && appointmentModalitiesByCategory) {
      // Resetar formulário com valores do agendamento
      // Garantir que as modalidades foram carregadas antes de definir o valor
      console.log("Modalidade do agendamento:", appointment.modality);
      
      const appointmentData = {
        patientId: appointment.patient.id,
        doctorId: appointment.doctor.id,
        appointmentPrice: appointment.appointmentPriceInCents / 100,
        modality: appointment.modality || "",
        date: dayjs(appointment.date).utc().tz("America/Sao_Paulo").toDate(),
        time: dayjs(appointment.date)
          .utc()
          .tz("America/Sao_Paulo")
          .format("HH:mm"),
        isReturn: appointment.isReturn || false,
      };
      
      form.reset(appointmentData);
      
      // Garantir que a modalidade seja definida após o reset
      // Usar setTimeout para garantir que o select foi renderizado
      setTimeout(() => {
        if (appointment.modality) {
          form.setValue("modality", appointment.modality, {
            shouldValidate: false,
            shouldDirty: false,
          });
        }
      }, 100);
    }
  }, [isOpen, appointment, form, appointmentModalitiesByCategory]);

  const updateAppointmentAction = useAction(updateAppointment, {
    onSuccess: () => {
      toast.success("Agendamento atualizado com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao atualizar agendamento.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form values:", values);
    console.log("Appointment ID:", appointment.id);

    updateAppointmentAction.execute({
      id: appointment.id,
      ...values,
      appointmentPriceInCents: values.appointmentPrice * 100,
    });
  };

  const isDateAvailable = (date: Date) => {
    // Se não há médico selecionado, permitir qualquer data
    if (!selectedDoctorId) return true;

    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === selectedDoctorId,
    );
    if (!selectedDoctor) return true;

    const dayOfWeek = date.getDay();
    return (
      dayOfWeek >= selectedDoctor?.availableFromWeekDay &&
      dayOfWeek <= selectedDoctor?.availableToWeekDay
    );
  };

  const isDateTimeEnabled = selectedPatientId && selectedDoctorId;

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Editar agendamento</DialogTitle>
        <DialogDescription>
          Edite as informações do agendamento de {appointment.patient.name}.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {getSpecialtyLabel(doctor.specialty)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidade do Atendimento</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || appointment.modality}
                  defaultValue={appointment.modality}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma modalidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {appointmentModalitiesByCategory &&
                    appointmentModalitiesByCategory.length > 0 ? (
                      appointmentModalitiesByCategory.map((category) => (
                        <SelectGroup key={category.categoryKey}>
                          <SelectLabel>{category.categoryName}</SelectLabel>
                          {category.modalities && category.modalities.length > 0
                            ? category.modalities.map((modality) => (
                                <SelectItem
                                  key={modality.code}
                                  value={modality.name}
                                >
                                  {modality.name}
                                </SelectItem>
                              ))
                            : null}
                        </SelectGroup>
                      ))
                    ) : (
                      <SelectItem value="no-modalities" disabled>
                        Nenhuma modalidade disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isReturn"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>É uma volta do paciente</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta</FormLabel>
                <NumericFormat
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value.floatValue);
                  }}
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  thousandSeparator="."
                  prefix="R$ "
                  allowNegative={false}
                  customInput={Input}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        return !isDateAvailable(date);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedDate}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-time" disabled>
                        Selecione um médico primeiro
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={updateAppointmentAction.isPending}>
              {updateAppointmentAction.isPending
                ? "Atualizando..."
                : "Atualizar agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default EditAppointmentForm;
