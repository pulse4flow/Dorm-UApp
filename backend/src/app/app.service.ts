import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    try {
      // Verify the schema is actually present, not just that the SQLite file opened.
      // An empty/missing dev.db still opens fine, so this guards against a backend
      // that has been started without `pnpm demo:setup` ever having run.
      const table = await this.prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master WHERE type='table' AND name='User'`;
      if (!table.length) {
        throw new Error('User table missing — run: pnpm demo:setup (demo:reset for a clean slate)');
      }
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      const detail =
        error instanceof Error && error.message.includes('demo:setup')
          ? error.message
          : 'database is not initialized — run: pnpm demo:setup';
      throw new ServiceUnavailableException({ status: 'error', database: 'disconnected', message: detail });
    }
  }
}