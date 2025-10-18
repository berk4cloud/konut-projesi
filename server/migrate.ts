import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }

  console.log('🚀 Running database migrations...');

  try {
    // Use psql directly to apply migrations
    // This avoids the "multiple commands in prepared statement" error with Drizzle + Neon
    const { stdout, stderr } = await execAsync(
      `psql "$DATABASE_URL" < migrations/0000_futuristic_living_mummy.sql`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    );

    if (stderr && !stderr.includes('NOTICE')) {
      console.error('⚠️  Migration warnings:', stderr);
    }

    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

runMigration();
