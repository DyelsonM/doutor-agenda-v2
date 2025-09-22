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

async function analyzeAppointmentTimes() {
  console.log("🔍 Analisando horários de agendamentos...\n");

  try {
    // Buscar todos os agendamentos com informações do paciente e médico
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

    console.log(
      `📊 Encontrados ${appointments.length} agendamentos no banco\n`,
    );

    let needsFixCount = 0;
    let correctCount = 0;
    const appointmentsToFix = [];

    for (const appointment of appointments) {
      const originalDate = new Date(appointment.date);
      const originalTime = originalDate.toTimeString().split(" ")[0]; // HH:MM:SS
      const hour = parseInt(originalTime.split(":")[0]);

      // Verificar se o horário está com diferença de 3 horas (problema UTC)
      if (hour >= 0 && hour <= 6) {
        const correctedDate = dayjs(originalDate).add(3, "hour").toDate();
        const correctedTime = correctedDate.toTimeString().split(" ")[0];

        appointmentsToFix.push({
          id: appointment.id,
          patientName: appointment.patient_name,
          doctorName: appointment.doctor_name,
          originalTime,
          correctedTime,
          originalDate: originalDate.toISOString(),
          correctedDate: correctedDate.toISOString(),
        });

        needsFixCount++;
      } else {
        correctCount++;
      }
    }

    console.log(`📈 Análise concluída:`);
    console.log(`🔧 Agendamentos que precisam de correção: ${needsFixCount}`);
    console.log(`✅ Agendamentos corretos: ${correctCount}\n`);

    if (needsFixCount > 0) {
      console.log("📋 Lista de agendamentos que serão corrigidos:\n");
      appointmentsToFix.forEach((apt, index) => {
        console.log(`${index + 1}. ID: ${apt.id}`);
        console.log(`   Paciente: ${apt.patientName}`);
        console.log(`   Médico: ${apt.doctorName}`);
        console.log(`   Horário atual: ${apt.originalTime}`);
        console.log(`   Horário corrigido: ${apt.correctedTime}`);
        console.log(`   Data atual: ${apt.originalDate}`);
        console.log(`   Data corrigida: ${apt.correctedDate}\n`);
      });

      console.log(
        "⚠️  ATENÇÃO: Esta operação irá alterar os dados no banco de produção!",
      );
      console.log(
        "💡 Para executar a correção, rode: node scripts/fix-appointment-times-execute.js",
      );
    } else {
      console.log("🎉 Todos os agendamentos já estão com horários corretos!");
    }
  } catch (error) {
    console.error("❌ Erro na análise:", error);
  } finally {
    await sql.end();
  }
}

// Executar a análise
analyzeAppointmentTimes().catch(console.error);
