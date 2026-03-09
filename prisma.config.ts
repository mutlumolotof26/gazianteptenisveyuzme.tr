import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// .env.local'i de yükle (.env'deki değerlerin üzerine yazar)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  migrate: {
    async adapter(env) {
      const pool = new Pool({ connectionString: env["DATABASE_URL"] });
      return new PrismaPg(pool);
    },
  },
});
