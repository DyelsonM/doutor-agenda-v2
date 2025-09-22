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

async function debugAppointmentTimes() {
  console.log("🔍 Debug detalhado dos horários de agendamentos...\n");

  try {
    // Buscar todos os agendamentos com informações do paciente e médico
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

    console.log(
      `📊 Encontrados ${appointments.rows.length} agendamentos no banco\n`,
    );

    appointments.rows.forEach((appointment, index) => {
      console.log(`\n--- Agendamento ${index + 1} ---`);
      console.log(`ID: ${appointment.id}`);
      console.log(`Paciente: ${appointment.patient_name}`);
      console.log(`Médico: ${appointment.doctor_name}`);
      console.log(`Data/Hora no banco: ${appointment.date}`);

      // Analisar a data de diferentes formas
      const rawDate = new Date(appointment.date);
      console.log(`Data como objeto Date: ${rawDate}`);
      console.log(`Timezone offset: ${rawDate.getTimezoneOffset()} minutos`);
      console.log(`UTC string: ${rawDate.toUTCString()}`);
      console.log(`ISO string: ${rawDate.toISOString()}`);
      console.log(`Local string: ${rawDate.toString()}`);

      // Usando dayjs
      const dayjsDate = dayjs(appointment.date);
      console.log(`Dayjs local: ${dayjsDate.format("YYYY-MM-DD HH:mm:ss")}`);
      console.log(
        `Dayjs UTC: ${dayjsDate.utc().format("YYYY-MM-DD HH:mm:ss")}`,
      );

      // Verificar se há diferença de 3 horas
      const hour = rawDate.getHours();
      const minute = rawDate.getMinutes();
      console.log(
        `Hora local: ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      );

      if (hour >= 0 && hour <= 6) {
        const correctedDate = dayjs(rawDate).add(3, "hour").toDate();
        console.log(
          `⚠️  POSSÍVEL PROBLEMA: Horário muito cedo (${hour}:${minute.toString().padStart(2, "0")})`,
        );
        console.log(
          `🔧 Seria corrigido para: ${correctedDate.getHours().toString().padStart(2, "0")}:${correctedDate.getMinutes().toString().padStart(2, "0")}`,
        );
      } else {
        console.log(
          `✅ Horário parece correto: ${hour}:${minute.toString().padStart(2, "0")}`,
        );
      }
    });
  } catch (error) {
    console.error("❌ Erro na análise:", error);
  } finally {
    await pool.end();
  }
}

// Executar a análise
debugAppointmentTimes().catch(console.error);
