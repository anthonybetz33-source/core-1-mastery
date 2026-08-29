import { spawn } from 'node:child_process';

const [, , command, ...args] = process.argv;
if (!command) {
  console.error('Usage: node scripts/with-app-env.mjs <command> [args...]');
  process.exit(2);
}

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});
child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});
child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
