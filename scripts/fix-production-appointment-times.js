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

async function fixProductionAppointmentTimes() {
  console.log("🔧 Corrigindo horários de agendamentos em PRODUÇÃO...\n");
  console.log("⚠️  ATENÇÃO: Este script irá alterar dados em PRODUÇÃO!\n");

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

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const appointment of appointments.rows) {
      try {
        const originalDate = new Date(appointment.date);
        const originalTime = originalDate.toTimeString().split(" ")[0];
        const hour = parseInt(originalTime.split(":")[0]);

        console.log(
          `\n--- Processando: ${appointment.patient_name} com ${appointment.doctor_name} ---`,
        );
        console.log(`Data original: ${appointment.date}`);
        console.log(`Hora original: ${originalTime}`);
        console.log(`Hora como número: ${hour}`);

        // Verificar se o horário está com diferença de 3 horas (problema UTC)
        // Em produção, os horários podem estar sendo salvos como UTC mas interpretados como local
        if (hour >= 0 && hour <= 6) {
          const correctedDate = dayjs(originalDate).add(3, "hour").toDate();
          const correctedTime = correctedDate.toTimeString().split(" ")[0];

          console.log(`🔧 CORRIGINDO: ${originalTime} → ${correctedTime}`);

          await pool.query(`UPDATE appointments SET date = $1 WHERE id = $2`, [
            correctedDate.toISOString(),
            appointment.id,
          ]);

          console.log(`✅ Corrigido com sucesso!`);
          fixedCount++;
        } else {
          console.log(`⏭️  Horário ${originalTime} não precisa de correção`);
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
      console.log(
        `🔄 Reinicie a aplicação para garantir que as mudanças sejam refletidas.`,
      );
    } else {
      console.log(`\n🤔 Nenhum agendamento precisou de correção.`);
      console.log(
        `💡 O problema pode estar na renderização da interface, não nos dados.`,
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
fixProductionAppointmentTimes().catch(console.error);
