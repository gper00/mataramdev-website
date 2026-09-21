import { z } from "zod";

/**
 * Single source of truth for environment variables.
 *
 * Next.js inlines `NEXT_PUBLIC_*` values at build time, so every read below must
 * stay a static `process.env.SOMETHING` lookup. Dynamic lookups such as
 * `process.env[key]` are never inlined and would silently break in the browser.
 */

/** `.env.example` ships placeholders like `https://<project-ref>.supabase.co`. */
const PLACEHOLDER_CHARS = /[<>]/;

const SUPABASE_ENV_HELP =
  "https://supabase.com/dashboard/project/_/settings/api";

const isValidHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

/** Reports the most specific problem, or `null` when the value is usable. */
const describeSupabaseUrl = (value: string): string | null => {
  if (value.length === 0) return "is missing or empty";
  if (PLACEHOLDER_CHARS.test(value)) {
    return "still holds the placeholder from .env.example";
  }
  if (!isValidHttpUrl(value)) {
    return "must be a full http(s) URL, e.g. https://your-project.supabase.co";
  }
  return null;
};

const describeSupabaseKey = (value: string): string | null => {
  if (value.length === 0) return "is missing or empty";
  if (PLACEHOLDER_CHARS.test(value)) {
    return "still holds the placeholder from .env.example";
  }
  return null;
};

const describedVar = (describe: (value: string) => string | null) =>
  z.string().superRefine((value, ctx) => {
    const problem = describe(value);
    if (problem) ctx.addIssue({ code: "custom", message: problem });
  });

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: describedVar(describeSupabaseUrl),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: describedVar(describeSupabaseKey),
});

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

/**
 * Thrown when required environment variables are absent or unusable.
 * The message is written for a human reading a terminal or a browser tab.
 */
export class EnvError extends Error {
  readonly issues: string[];

  constructor(summary: string, issues: string[]) {
    const report = [
      summary,
      "",
      ...issues.map((issue) => `  - ${issue}`),
      "",
      "Fix:",
      "  1. Copy .env.example to .env.local (if you have not already).",
      `  2. Fill in the values from ${SUPABASE_ENV_HELP}`,
      "  3. Restart the server — Next.js only reads .env* files at startup.",
    ].join("\n");

    super(report);
    this.name = "EnvError";
    this.issues = issues;
  }
}

export function isEnvError(error: unknown): error is EnvError {
  return error instanceof Error && error.name === "EnvError";
}

let cachedSupabaseEnv: SupabaseEnv | null = null;

/**
 * Validates and returns the public Supabase credentials.
 * Validated lazily so a missing `.env.local` fails on the first request
 * instead of crashing the build.
 */
export function getSupabaseEnv(): SupabaseEnv {
  if (cachedSupabaseEnv) return cachedSupabaseEnv;

  const parsed = supabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  });

  if (!parsed.success) {
    throw new EnvError(
      "Supabase environment variables are missing or invalid.",
      parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      ),
    );
  }

  cachedSupabaseEnv = {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  return cachedSupabaseEnv;
}
