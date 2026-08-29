/**
 * Build-time migration entry point. Static GitHub Pages builds do not have a
 * database, so this script intentionally becomes a no-op when no DATABASE_URL
 * is supplied. Runtime/server deployments can run their own DB bootstrap.
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pendingMigrations } from './migration-plan.mjs';

const migrationsDir = join(process.cwd(), 'migrations');
try {
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const paths = entries.filter((e) => e.isFile() && e.name.endsWith('.sql')).map((e) => join(migrationsDir, e.name));
  const plan = pendingMigrations(paths, []);
  if (plan.length) {
    if (!process.env.DATABASE_URL?.trim()) {
      console.log(`[migrate] ${plan.length} migration(s) present; no DATABASE_URL, skipping database migration.`);
    } else {
      console.log(`[migrate] ${plan.length} migration(s) require the deployment database bootstrap.`);
    }
  }
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
