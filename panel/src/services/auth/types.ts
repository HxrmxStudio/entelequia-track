/**
 * Shared user interface for authentication responses
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

/**
 * Client-side authentication request/response types
 * These types exclude server-only token fields for client safety
 */
export interface LoginRequest { 
  email: string; 
  password: string; 
  device?: string;
}

/**
 * Client-facing login response - only includes user data
 * Access tokens are handled server-side only via HttpOnly cookies
 */
export interface LoginResponse {
  user: User;
}

export interface RegisterRequest { 
  email: string; 
  password: string; 
  name?: string;
  device?: string;
}

/**
 * Client-facing register response - only includes user data
 * Access tokens are handled server-side only via HttpOnly cookies
 */
export interface RegisterResponse {
  user: User;
}

/**
 * Server-side authentication response types
 * These include access tokens that are only used in server contexts
 */
export interface ServerLoginResponse {
  access_token: string;
  exp: number;
  token_type: "Bearer";
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  exp: number;
  token_type: "Bearer";
  user: User;
}