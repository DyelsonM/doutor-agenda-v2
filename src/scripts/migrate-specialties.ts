import { db } from "../db";
import { medicalSpecialtiesTable } from "../db/schema";
import { DOCTOR_SPECIALTIES } from "../constants/medical-specialties";

// Script para migrar especialidades estáticas para o banco de dados
// Execute este script uma vez para popular o banco com as especialidades existentes

async function migrateSpecialties() {
  console.log("Iniciando migração de especialidades...");

  try {
    // Para cada clínica, vamos adicionar as especialidades padrão
    // Nota: Você precisará ajustar o clinicId conforme necessário
    const defaultClinicId = "your-clinic-id-here"; // Substitua pelo ID da sua clínica

    const specialtiesToInsert = [];

    // Iterar sobre todas as categorias e especialidades
    for (const [categoryKey, category] of Object.entries(DOCTOR_SPECIALTIES)) {
      for (const specialty of category.specialties) {
        specialtiesToInsert.push({
          clinicId: defaultClinicId,
          code: specialty.code,
          name: specialty.name,
          category: category.category,
          description: `Especialidade em ${category.category}`,
          isActive: true,
        });
      }
    }

    // Inserir todas as especialidades
    await db.insert(medicalSpecialtiesTable).values(specialtiesToInsert);

    console.log(
      `✅ Migração concluída! ${specialtiesToInsert.length} especialidades inseridas.`,
    );
  } catch (error) {
    console.error("❌ Erro na migração:", error);
  }
}

// Executar a migração
migrateSpecialties().then(() => {
  console.log("Migração finalizada.");
  process.exit(0);
});
