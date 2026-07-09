#!/usr/bin/env node
// Frees the ports used by the booth kiosk + all games (leftover dev servers
// from a previous run are the most common cause of "port already in use"),
// then launches them all together.

const { execSync, spawn } = require('child_process');

const PORTS = [5173, 5175, 5176, 5177, 5178, 5179];

for (const port of PORTS) {
  let pids = '';
  try {
    pids = execSync(`lsof -ti tcp:${port}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    continue; // nothing listening on this port
  }
  if (!pids) continue;
  for (const pid of pids.split('\n')) {
    console.log(`Freeing port ${port} (killing pid ${pid})`);
    try {
      process.kill(Number(pid), 'SIGKILL');
    } catch {
      // already gone
    }
  }
}

const child = spawn(
  'pnpm',
  ['-r', '--parallel', '--filter', './games/*', '--filter', 'booth-kiosk', 'run', 'dev'],
  { stdio: 'inherit' }
);

child.on('exit', code => process.exit(code ?? 0));
