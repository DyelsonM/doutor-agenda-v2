require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Configuração do banco de dados
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL não encontrada nas variáveis de ambiente");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
});

async function backupProductionAppointments() {
  console.log("💾 Criando backup dos agendamentos de PRODUÇÃO...\n");

  try {
    // Buscar todos os agendamentos
    const appointments = await pool.query(`
      SELECT 
        a.id, 
        a.date, 
        a.created_at,
        a.updated_at,
        a.patient_id,
        a.doctor_id,
        a.appointment_price_in_cents,
        a.modality,
        a.clinic_id,
        p.name as patient_name,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.created_at DESC
    `);

    console.log(
      `📊 Encontrados ${appointments.rows.length} agendamentos para backup\n`,
    );

    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, "..", "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(
      backupDir,
      `production-appointments-backup-${timestamp}.json`,
    );

    // Salvar backup
    fs.writeFileSync(backupFile, JSON.stringify(appointments.rows, null, 2));

    console.log(`✅ Backup criado com sucesso: ${backupFile}`);
    console.log(`📁 Localização: ${path.resolve(backupFile)}`);
    console.log(`📊 Total de registros: ${appointments.rows.length}`);

    // Criar também um backup em formato SQL
    const sqlBackupFile = path.join(
      backupDir,
      `production-appointments-backup-${timestamp}.sql`,
    );
    let sqlContent =
      "-- Backup dos agendamentos de PRODUÇÃO antes da correção de horários\n";
    sqlContent += `-- Data: ${new Date().toISOString()}\n`;
    sqlContent += `-- Total de registros: ${appointments.rows.length}\n\n`;

    appointments.rows.forEach((appointment) => {
      sqlContent += `UPDATE appointments SET date = '${appointment.date}' WHERE id = '${appointment.id}';\n`;
    });

    fs.writeFileSync(sqlBackupFile, sqlContent);
    console.log(`✅ Backup SQL criado: ${sqlBackupFile}`);

    console.log(
      `\n⚠️  IMPORTANTE: Salve estes arquivos em local seguro antes de executar a correção!`,
    );
  } catch (error) {
    console.error("❌ Erro ao criar backup:", error);
  } finally {
    await pool.end();
    console.log("\n🏁 Backup finalizado!");
  }
}

// Executar o backup
backupProductionAppointments().catch(console.error);
