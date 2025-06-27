import { Logger, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

let nestAppPromise: Promise<NestExpressApplication> | null = null;

export async function getNestApp() {
  if (!nestAppPromise) {
    const isDev = process.env.NODE_ENV !== 'production';
    const logLevels: LogLevel[] = isDev
      ? ['error', 'warn', 'log', 'debug', 'verbose']
      : ['error', 'warn', 'log'];
    nestAppPromise = NestFactory.create<NestExpressApplication>(AppModule, {
      logger: logLevels,
    }).then((app) => app.init());
  }
  return nestAppPromise;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await getNestApp(); // built once per container
    // Start the HTTP server for health checks
    const { SERVER_SETTINGS__PORT = 8080 } = process.env;
    await app.listen(SERVER_SETTINGS__PORT);
    logger.log(
      `Kafka Consumer service is running on port ${SERVER_SETTINGS__PORT}`,
    );
    logger.log(
      `Health check available at: http://localhost:${SERVER_SETTINGS__PORT}/health`,
    );
    // Handle graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
      // Fix 1: Use non-async function with promise handling
      process.on(signal, () => {
        logger.log(`Received ${signal} signal, shutting down gracefully`);
        app
          .close()
          .then(() => {
            logger.log('Application shutdown complete');
            process.exit(0);
          })
          .catch((error: Error) => {
            // Fix 2: Type the error parameter
            logger.error(
              `Error during shutdown: ${error.message}`,
              error.stack,
            );
            process.exit(1);
          });
      });
    });
  } catch (error: unknown) {
    // Fix 3: Type error as unknown for safety
    // Fix 4: Type guard for the error object
    if (error instanceof Error) {
      logger.error(
        `Failed to start application: ${error.message}`,
        error.stack,
      );
    } else {
      logger.error(`Failed to start application: ${String(error)}`);
    }
    process.exit(1);
  }
}

// Fix 5: Handle the promise returned by bootstrap
void bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  if (error instanceof Error) {
    logger.error(`Uncaught bootstrap error: ${error.message}`, error.stack);
  } else {
    logger.error(`Uncaught bootstrap error: ${String(error)}`);
  }
  process.exit(1);
});
