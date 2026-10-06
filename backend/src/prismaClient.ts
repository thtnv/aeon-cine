import { PrismaClient } from '@prisma/client';

// 1. Primary Client (Connecting to local PostgreSQL for instant operations)
const primaryPrisma = new PrismaClient();

// 2. Secondary Client (Connecting to Supabase Cloud Pooler if configured)
let supabasePrisma: PrismaClient | null = null;
if (process.env.SUPABASE_DATABASE_URL && process.env.SUPABASE_DATABASE_URL !== process.env.DATABASE_URL) {
  try {
    supabasePrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.SUPABASE_DATABASE_URL,
        },
      },
    });
    console.log('⚡ [DualSync] Supabase Cloud Pooler secondary client initialized.');
  } catch (err: any) {
    console.warn('⚠️ [DualSync] Failed to initialize secondary Supabase client:', err.message);
  }
}

// Set of write / mutation operations to replicate
const mutationOperations = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
]);

// 3. Extend primary client with Dual-Sync query hook
const prisma = primaryPrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // Run mutation/query on primary DB (local)
        const result = await query(args);

        // If this is a write operation and secondary DB is active, replicate in background
        if (mutationOperations.has(operation) && supabasePrisma && model) {
          (async () => {
            try {
              const secModel = (supabasePrisma as any)[model];
              if (secModel && typeof secModel[operation] === 'function') {
                let syncArgs = args;
                if (operation === 'create' && result && typeof result === 'object' && (result as any).id) {
                  syncArgs = {
                    ...args,
                    data: {
                      ...args.data,
                      id: (result as any).id,
                    },
                  };
                }
                await secModel[operation](syncArgs);
                console.log(`⚡ [DualSync ✓] Replicated ${model}.${operation} to Supabase Cloud.`);
              }
            } catch (err: any) {
              console.warn(`⚠️ [DualSync] Cloud replication for ${model}.${operation}:`, err.message);
            }
          })();
        }

        return result;
      },
    },
  },
});

export default prisma as unknown as PrismaClient;
