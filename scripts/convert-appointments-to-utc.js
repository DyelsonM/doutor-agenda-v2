require("dotenv").config();
const { Pool } = require("pg");
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

const pool = new Pool({
  connectionString: connectionString,
});

async function convertAppointmentsToUTC() {
  console.log("🔄 Convertendo agendamentos existentes para UTC...\n");
  console.log("⚠️  ATENÇÃO: Este script irá alterar dados no banco!\n");

  try {
    // Buscar todos os agendamentos
    const appointments = await pool.query(`
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
    `);

    console.log(`📊 Processando ${appointments.rows.length} agendamentos...\n`);

    let convertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const appointment of appointments.rows) {
      try {
        const originalDate = new Date(appointment.date);
        const originalTime = originalDate.toTimeString().split(" ")[0];

        console.log(
          `\n--- Processando: ${appointment.patient_name} com ${appointment.doctor_name} ---`,
        );
        console.log(`Data original: ${appointment.date}`);
        console.log(`Hora original: ${originalTime}`);

        // Converter para UTC
        const utcDate = dayjs(originalDate).utc().toDate();
        const utcTime = utcDate.toTimeString().split(" ")[0];

        console.log(`🔄 Convertendo para UTC: ${originalTime} → ${utcTime}`);

        await pool.query(`UPDATE appointments SET date = $1 WHERE id = $2`, [
          utcDate.toISOString(),
          appointment.id,
        ]);

        console.log(`✅ Convertido com sucesso!`);
        convertedCount++;
      } catch (error) {
        console.error(
          `❌ Erro ao converter agendamento ${appointment.id}:`,
          error.message,
        );
        errorCount++;
      }
    }

    console.log(`\n📈 Resumo da conversão:`);
    console.log(`✅ Agendamentos convertidos: ${convertedCount}`);
    console.log(`⏭️  Agendamentos não alterados: ${skippedCount}`);
    console.log(`❌ Erros: ${errorCount}`);

    if (convertedCount > 0) {
      console.log(`\n🎉 Conversão concluída com sucesso!`);
      console.log(`💡 Os agendamentos agora estão salvos em UTC.`);
      console.log(
        `🔄 Reinicie a aplicação para garantir que as mudanças sejam refletidas.`,
      );
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);
  } finally {
    await pool.end();
    console.log("\n🏁 Processo finalizado!");
  }
}

// Executar o script
convertAppointmentsToUTC().catch(console.error);
