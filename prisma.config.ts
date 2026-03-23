import { defineConfig } from 'prisma/config';

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  require('dotenv').config();
} catch {
  // Production: DATABASE_URL is injected by the runtime environment
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
});
