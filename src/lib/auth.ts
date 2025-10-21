import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersTable, usersToClinicsTable } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [
    "http://localhost:3000"
    
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      // Buscar dados do usuário e clínicas diretamente (sem cache)
      const userData = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, user.id),
      });

      const clinics = await db.query.usersToClinicsTable.findMany({
        where: eq(usersToClinicsTable.userId, user.id),
        with: {
          clinic: true,
          user: true,
        },
      });

      // TODO: Ao adaptar para o usuário ter múltiplas clínicas, deve-se mudar esse código
      const clinic = clinics?.[0];
      return {
        user: {
          ...user,
          role: userData?.role || "admin",
          clinic: clinic?.clinicId
            ? {
                id: clinic?.clinicId,
                name: clinic?.clinic?.name,
                logoUrl: clinic?.clinic?.logoUrl,
              }
            : undefined,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
    additionalFields: {
      role: {
        type: "string",
        fieldName: "role",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
});
