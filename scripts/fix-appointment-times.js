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

async function fixAppointmentTimes() {
  console.log("🔍 Iniciando correção dos horários de agendamentos...\n");

  try {
    // Buscar todos os agendamentos
    const appointments = await sql`
      SELECT id, date, created_at 
      FROM appointments 
      ORDER BY created_at DESC
    `;

    console.log(
      `📊 Encontrados ${appointments.length} agendamentos no banco\n`,
    );

    let fixedCount = 0;
    let errorCount = 0;

    for (const appointment of appointments) {
      try {
        const originalDate = new Date(appointment.date);
        const originalTime = originalDate.toTimeString().split(" ")[0]; // HH:MM:SS

        // Verificar se o horário está com diferença de 3 horas (problema UTC)
        const hour = parseInt(originalTime.split(":")[0]);

        // Se o horário está muito cedo (provavelmente foi salvo como UTC e convertido para local)
        // Vamos adicionar 3 horas para corrigir
        if (hour >= 0 && hour <= 6) {
          const correctedDate = dayjs(originalDate).add(3, "hour").toDate();

          await sql`
            UPDATE appointments 
            SET date = ${correctedDate.toISOString()}
            WHERE id = ${appointment.id}
          `;

          console.log(
            `✅ Corrigido agendamento ${appointment.id}: ${originalTime} → ${correctedDate.toTimeString().split(" ")[0]}`,
          );
          fixedCount++;
        } else {
          console.log(
            `⏭️  Agendamento ${appointment.id} com horário ${originalTime} não precisa de correção`,
          );
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
    console.log(
      `⏭️  Agendamentos não alterados: ${appointments.length - fixedCount - errorCount}`,
    );
    console.log(`❌ Erros: ${errorCount}`);
  } catch (error) {
    console.error("❌ Erro geral:", error);
  } finally {
    await sql.end();
    console.log("\n🏁 Correção finalizada!");
  }
}

// Executar o script
fixAppointmentTimes().catch(console.error);
