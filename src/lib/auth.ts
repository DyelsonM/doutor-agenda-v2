import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersTable, usersToClinicsTable } from "@/db/schema";

// Cache para dados do usuário (5 minutos)
const getUserData = unstable_cache(
  async (userId: string) => {
    return await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });
  },
  ["user-data"],
  {
    revalidate: 300, // 5 minutos
    tags: ["user-data"],
  },
);

// Cache para clínicas do usuário (5 minutos)
const getUserClinics = unstable_cache(
  async (userId: string) => {
    return await db.query.usersToClinicsTable.findMany({
      where: eq(usersToClinicsTable.userId, userId),
      with: {
        clinic: true,
        user: true,
      },
    });
  },
  ["user-clinics"],
  {
    revalidate: 300, // 5 minutos
    tags: ["user-clinics"],
  },
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      // Usando cache para dados do usuário e clínicas
      const [userData, clinics] = await Promise.all([
        getUserData(user.id),
        getUserClinics(user.id),
      ]);
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
