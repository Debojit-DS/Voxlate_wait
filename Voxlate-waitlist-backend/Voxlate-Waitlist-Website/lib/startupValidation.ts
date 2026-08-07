import { validateEnv } from "@/lib/db";
import { validateGoogleAuth } from "@/lib/auth";

export function validateStartup() {
  validateEnv();
  validateGoogleAuth();
}
