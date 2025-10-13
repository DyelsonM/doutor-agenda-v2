"use client";

import { CalendarIcon, Filter, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ReceivablesFiltersProps {
  filters: {
    status?: "pending" | "received";
    category?: string;
    startDate?: Date;
    endDate?: Date;
  };
  onFiltersChange: (filters: {
    status?: "pending" | "received";
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

const categoryLabels = {
  consultation: "Consulta",
  procedure: "Procedimento",
  examination: "Exame",
  treatment: "Tratamento",
  medication: "Medicação",
  equipment_rental: "Aluguel de Equipamento",
  professional_service: "Serviço Profissional",
  insurance_reimbursement: "Reembolso de Seguro",
  other: "Outros",
};

const statusLabels = {
  pending: "Pendente",
  received: "Recebido",
};

export function ReceivablesFilters({
  filters,
  onFiltersChange,
}: ReceivablesFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : (status as any),
    });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === "all" ? undefined : category,
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      startDate: date,
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      endDate: date,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: undefined,
      category: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros</span>
          {hasActiveFilters && (
            <span className="text-muted-foreground text-xs">
              ({Object.values(filters).filter(Boolean).length} ativo
              {Object.values(filters).filter(Boolean).length !== 1 ? "s" : ""})
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <Select
            value={filters.category || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data inicial */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data inicial</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? (
                  filters.startDate.toLocaleDateString("pt-BR")
                ) : (
                  <span>Selecionar data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={handleStartDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data final */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data final</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? (
                  filters.endDate.toLocaleDateString("pt-BR")
                ) : (
                  <span>Selecionar data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={handleEndDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
