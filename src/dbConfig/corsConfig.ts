import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsOptions: CorsOptions = {
  origin: ['https://meta2day.online'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization','Content-Type', 'Accept'],
  exposedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
};