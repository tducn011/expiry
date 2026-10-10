import { createApp } from './app.mjs';
import { loadEnv } from './shared/connection.mjs';

async function bootstrap() {
  const env = await loadEnv();
  const port = process.env.PORT || 3001;
  const app = createApp();

  const server = app.listen(port, () => {
    console.log(`[Expiry API] Server listening on port ${port}`);
    console.log(`[Expiry API] Target MySQL Database: ${env.database} on ${env.host}:${env.port}`);
  });

  const shutdown = () => {
    console.log('\n[Expiry API] Shutting down gracefully...');
    server.close(() => {
      console.log('[Expiry API] Closed all connections.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(err => {
  console.error('[Expiry API] Fatal startup error:', err);
  process.exit(1);
});
