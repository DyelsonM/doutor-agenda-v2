import { db } from "@/db";
import { appointmentModalitiesTable } from "@/db/schema";
import { APPOINTMENT_MODALITIES } from "@/constants/medical-specialties";

async function migrateModalities() {
  console.log("Iniciando migração das modalidades...");

  try {
    // Para cada clínica, vamos inserir as modalidades padrão
    // Primeiro, vamos buscar todas as clínicas
    const clinics = await db.query.clinicsTable.findMany();

    for (const clinic of clinics) {
      console.log(`Migrando modalidades para clínica: ${clinic.name}`);

      // Inserir todas as modalidades padrão
      const modalitiesToInsert = Object.values(APPOINTMENT_MODALITIES).flatMap(
        (category) =>
          category.modalities.map((modality) => ({
            clinicId: clinic.id,
            code: modality.code,
            name: modality.name,
            category: category.category,
            description: null,
            isActive: true,
          })),
      );

      await db.insert(appointmentModalitiesTable).values(modalitiesToInsert);
      console.log(
        `Inseridas ${modalitiesToInsert.length} modalidades para ${clinic.name}`,
      );
    }

    console.log("Migração concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a migração:", error);
  }
}

// Executar a migração se este arquivo for executado diretamente
if (require.main === module) {
  migrateModalities()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateModalities };
