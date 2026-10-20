export function registerShutdownHandlers(server, closePools, processRef = process, timeoutMs = 10_000) {
  let shuttingDown = false;

  const shutdown = (exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log('\n[Expiry API] Shutting down gracefully...');
    const timeout = setTimeout(() => {
      console.error('[Expiry API] Force shutdown after timeout.');
      processRef.exit(1);
    }, timeoutMs);

    server.close(error => {
      void (async () => {
        let finalExitCode = exitCode;
        if (error) {
          console.error('[Expiry API] Error closing HTTP server:', error);
          finalExitCode = 1;
        }

        try {
          await closePools();
          console.log('[Expiry API] Closed all connections.');
        } catch (closeError) {
          console.error('[Expiry API] Error closing database pools:', closeError);
          finalExitCode = 1;
        }

        clearTimeout(timeout);
        processRef.exit(finalExitCode);
      })();
    });

    server.closeIdleConnections();
  };

  processRef.on('SIGINT', () => shutdown());
  processRef.on('SIGTERM', () => shutdown());
  processRef.on('unhandledRejection', reason => {
    console.error('[Expiry API] Unhandled promise rejection:', reason);
    shutdown(1);
  });
  processRef.on('uncaughtException', error => {
    console.error('[Expiry API] Uncaught exception:', error);
    shutdown(1);
  });

  return shutdown;
}
