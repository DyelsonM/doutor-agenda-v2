"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import UpsertMedicalSpecialtyForm from "./upsert-medical-specialty-form";

const AddMedicalSpecialtyButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Especialidade
      </Button>
      <UpsertMedicalSpecialtyForm
        isOpen={isOpen}
        onSuccess={() => setIsOpen(false)}
      />
    </>
  );
};

export default AddMedicalSpecialtyButton;
