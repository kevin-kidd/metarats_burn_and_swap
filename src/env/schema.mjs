// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  MNEMONIC: z.string(),
  SUPABASE_KEY: z.string(),
  SUPABASE_URL: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.input<typeof serverSchema>]: string | undefined }}
 */
export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV,
  MNEMONIC: process.env.MNEMONIC,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
};

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS: z.string(),
  NEXT_PUBLIC_SECRET_CONTRACT_HASH: z.string(),
  NEXT_PUBLIC_SECRET_CHAIN_ID: z.string(),
  NEXT_PUBLIC_STARGAZE_MINTER: z.string(),
  NEXT_PUBLIC_STARGAZE_SG721: z.string(),
  NEXT_PUBLIC_SECRET_REST_URL: z.string(),
  NEXT_PUBLIC_SECRET_RPC_URL: z.string(),
  NEXT_PUBLIC_STARGAZE_RPC_URL: z.string(),
  NEXT_PUBLIC_SECRET_BACKEND_ADDRESS: z.string(),
  NEXT_PUBLIC_STARGAZE_CHAIN_ID: z.string(),
  NEXT_PUBLIC_STARGAZE_BACKEND_ADDRESS: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.input<typeof clientSchema>]: string | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS,
  NEXT_PUBLIC_SECRET_RPC_URL: process.env.NEXT_PUBLIC_SECRET_RPC_URL,
  NEXT_PUBLIC_SECRET_CONTRACT_HASH:
    process.env.NEXT_PUBLIC_SECRET_CONTRACT_HASH,
  NEXT_PUBLIC_SECRET_CHAIN_ID: process.env.NEXT_PUBLIC_SECRET_CHAIN_ID,
  NEXT_PUBLIC_STARGAZE_MINTER: process.env.NEXT_PUBLIC_STARGAZE_MINTER,
  NEXT_PUBLIC_STARGAZE_SG721: process.env.NEXT_PUBLIC_STARGAZE_SG721,
  NEXT_PUBLIC_SECRET_REST_URL: process.env.NEXT_PUBLIC_SECRET_REST_URL,
  NEXT_PUBLIC_STARGAZE_RPC_URL: process.env.NEXT_PUBLIC_STARGAZE_RPC_URL,
  NEXT_PUBLIC_SECRET_BACKEND_ADDRESS:
    process.env.NEXT_PUBLIC_SECRET_BACKEND_ADDRESS,
  NEXT_PUBLIC_STARGAZE_CHAIN_ID: process.env.NEXT_PUBLIC_STARGAZE_CHAIN_ID,
  NEXT_PUBLIC_STARGAZE_BACKEND_ADDRESS:
    process.env.NEXT_PUBLIC_STARGAZE_BACKEND_ADDRESS,
};
