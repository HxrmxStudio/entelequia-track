/**
 * Type guards for runtime type checking and validation
 * Follows SRP by providing single-purpose validation functions
 */

import type { ShipmentStatus, DeliveryMethod } from "@/services/shipments/types";

/**
 * Validates if a string is a valid ShipmentStatus
 */
export function isShipmentStatus(value: unknown): value is ShipmentStatus {
  return typeof value === "string" && 
    ["queued", "out_for_delivery", "delivered", "failed", "canceled"].includes(value);
}

/**
 * Validates if a string is a valid DeliveryMethod
 */
export function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return typeof value === "string" && 
    ["courier", "pickup", "carrier", "other"].includes(value);
}

/**
 * Validates if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates if a value is a valid UUID v4
 */
export function isUuidV4(value: unknown): value is string {
  if (typeof value !== "string") return false;
  
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
}

/**
 * Validates if a value is a valid date string
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Validates if an object has required properties
 */
export function hasRequiredProps<T extends Record<string, unknown>>(
  obj: unknown,
  requiredProps: string[]
): obj is T {
  if (!obj || typeof obj !== "object") return false;
  
  const objRecord = obj as Record<string, unknown>;
  return requiredProps.every(prop => 
    prop in objRecord && objRecord[prop] !== undefined
  );
}

/**
 * Safe type assertion with fallback
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  fallback: T
): T {
  return guard(value) ? value : fallback;
}

/**
 * Validates an array contains only valid items of a specific type
 */
export function isArrayOf<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemGuard);
}
