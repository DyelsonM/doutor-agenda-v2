"use client";

import { useState, useEffect } from "react";

import { doctorsTable } from "@/db/schema";

import DoctorCard from "./doctor-card";

type Doctor = typeof doctorsTable.$inferSelect;

interface DoctorsPageClientProps {
  doctors: Doctor[];
}

export function DoctorsPageClient({ doctors }: DoctorsPageClientProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Garantir que o componente só renderize no cliente para evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filtrar médicos baseado na pesquisa
  const filteredDoctors = doctors.filter((doctor) => {
    if (!searchValue) return true;

    const matchesSearch =
      doctor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchValue.toLowerCase());

    return matchesSearch;
  });

  // Não renderizar até que esteja no cliente
  if (!isClient) {
    return (
      <div className="space-y-4">
        {/* Campo de pesquisa */}
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="Pesquisar médicos por nome ou email..."
            value=""
            disabled
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 pl-10 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <svg
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Carregando médicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de pesquisa */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Pesquisar médicos por nome ou email..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 pl-10 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <svg
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Grid de médicos */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-muted-foreground text-lg font-semibold">
              Nenhum médico encontrado
            </h3>
            <p className="text-muted-foreground text-sm">
              Tente ajustar o termo de pesquisa
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
