import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsOptions: CorsOptions = {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
};