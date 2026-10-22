import { createApp } from './app.mjs';
import { loadEnv, closePools } from './shared/connection.mjs';
import { registerShutdownHandlers } from './shared/server-shutdown.mjs';

async function bootstrap() {
  const env = await loadEnv();
  const port = process.env.PORT || 3001;
  const app = createApp();

  const server = app.listen(port, () => {
    console.log(`[Expiry API] Server listening on port ${port}`);
    console.log(`[Expiry API] Target MySQL Database: ${env.database} on ${env.host}:${env.port}`);
  });

  registerShutdownHandlers(server, closePools);
}

bootstrap().catch(err => {
  console.error('[Expiry API] Fatal startup error:', err);
  process.exit(1);
});
