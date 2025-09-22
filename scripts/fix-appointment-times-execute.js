const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

// Configuração do banco de dados
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL não encontrada nas variáveis de ambiente");
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function executeAppointmentTimeFix() {
  console.log("🔧 Executando correção dos horários de agendamentos...\n");

  try {
    // Buscar todos os agendamentos
    const appointments = await sql`
      SELECT 
        a.id, 
        a.date, 
        a.created_at,
        p.name as patient_name,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.created_at DESC
    `;

    console.log(`📊 Processando ${appointments.length} agendamentos...\n`);

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const appointment of appointments) {
      try {
        const originalDate = new Date(appointment.date);
        const originalTime = originalDate.toTimeString().split(" ")[0];
        const hour = parseInt(originalTime.split(":")[0]);

        // Verificar se o horário está com diferença de 3 horas (problema UTC)
        if (hour >= 0 && hour <= 6) {
          const correctedDate = dayjs(originalDate).add(3, "hour").toDate();
          const correctedTime = correctedDate.toTimeString().split(" ")[0];

          await sql`
            UPDATE appointments 
            SET date = ${correctedDate.toISOString()}
            WHERE id = ${appointment.id}
          `;

          console.log(
            `✅ Corrigido: ${appointment.patient_name} com ${appointment.doctor_name}`,
          );
          console.log(`   ${originalTime} → ${correctedTime}`);
          fixedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(
          `❌ Erro ao corrigir agendamento ${appointment.id}:`,
          error.message,
        );
        errorCount++;
      }
    }

    console.log(`\n📈 Resumo da correção:`);
    console.log(`✅ Agendamentos corrigidos: ${fixedCount}`);
    console.log(`⏭️  Agendamentos não alterados: ${skippedCount}`);
    console.log(`❌ Erros: ${errorCount}`);

    if (fixedCount > 0) {
      console.log(`\n🎉 Correção concluída com sucesso!`);
      console.log(
        `💡 Os horários agora devem aparecer corretamente na interface.`,
      );
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);
  } finally {
    await sql.end();
    console.log("\n🏁 Processo finalizado!");
  }
}

// Executar o script
executeAppointmentTimeFix().catch(console.error);
