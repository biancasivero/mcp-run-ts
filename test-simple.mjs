import { spawn } from 'child_process';

const server = spawn('node', ['build/index.js'], {
  env: {
    ...process.env,
    SSE_FULL_URL: 'https://www.mcp.run/api/mcp/sse?nonce=aN5rE5HO4uqXgzNZomcRNA&username=diegofornalha&exp=1749345684581&profile=diegofornalha%2Fdefault&sig=cnkj3lXiki_3meMvd86HvUsOJdHYYK349qf5X_SQGuY'
  }
});

server.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

server.on('close', (code) => {
  console.log('Server closed with code:', code);
});

setTimeout(() => {
  server.kill();
  process.exit(0);
}, 3000);