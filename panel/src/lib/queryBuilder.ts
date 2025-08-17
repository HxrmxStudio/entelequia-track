/**
 * Utility for building URL query strings with proper type safety and null handling
 * Follows DRY principle by centralizing query parameter logic
 */

export type QueryValue = string | number | boolean | null | undefined;

export interface QueryParams {
  [key: string]: QueryValue;
}

// Extended type for more flexible query parameter objects
export type FlexibleQueryParams = Record<string, QueryValue>;

/**
 * Builds a URL query string from an object of parameters
 * @param params - Object containing query parameters
 * @returns Query string (without leading ?) or empty string if no valid params
 */
export function buildQueryString<T extends FlexibleQueryParams>(params: T): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    // Only add non-null, non-undefined, non-empty string values
    if (value !== null && value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  
  return searchParams.toString();
}

/**
 * Builds a full URL path with query string
 * @param basePath - Base path for the URL
 * @param params - Query parameters
 * @returns Complete path with query string if params exist
 */
export function buildUrlWithQuery<T extends FlexibleQueryParams>(
  basePath: string, 
  params?: T
): string {
  if (!params) return basePath;
  
  const queryString = buildQueryString(params);
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Type-safe query builder for endpoints with filtering
 * @param basePath - Base endpoint path
 * @param params - Filter parameters
 * @returns Function that returns the complete endpoint path
 */
export function createEndpointBuilder<T extends FlexibleQueryParams>(basePath: string) {
  return (params?: T): string => buildUrlWithQuery(basePath, params);
}
