import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  prisma,
  PrismaClient,
} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  // Prisma Client is for connect to the DB
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}
