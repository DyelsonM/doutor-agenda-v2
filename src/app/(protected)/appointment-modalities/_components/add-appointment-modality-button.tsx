"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

import UpsertAppointmentModalityForm from "./upsert-appointment-modality-form";

export default function AddAppointmentModalityButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Modalidade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <UpsertAppointmentModalityForm
          isOpen={open}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
