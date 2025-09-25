"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

import UpsertPartnerExamForm from "./upsert-partner-exam-form";

interface AddPartnerExamButtonProps {
  partnerId: string;
}

const AddPartnerExamButton = ({ partnerId }: AddPartnerExamButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Exame
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <UpsertPartnerExamForm
          partnerId={partnerId}
          isOpen={isOpen}
          onSuccess={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPartnerExamButton;
