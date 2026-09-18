import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // gzip/brotli-negotiated compression for every response — biggest
  // single win for GraphQL payloads (student/teacher lists, stats, etc.
  // are JSON and compress extremely well).
  app.use(compression());

  // Security headers. CSP is disabled here because the GraphQL Playground
  // (dev-only, see app.module.ts) needs inline scripts/styles; re-enable
  // a strict CSP if/when the playground is fully removed from prod builds.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
}
bootstrap();