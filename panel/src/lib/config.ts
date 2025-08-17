/**
 * Centralized configuration management
 * Follows SRP by providing single-purpose config access
 */

/**
 * Server-side configuration (not exposed to client)
 * Only available in server components and API routes
 */
export function getServerConfig() {
  return {
    apiUrl: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  };
}

/**
 * Client-side configuration (safely exposed to browser)
 * Only includes non-sensitive configuration
 */
export function getClientConfig() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  };
}

/**
 * Type-safe environment variable access
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Validates required environment variables
 */
export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
