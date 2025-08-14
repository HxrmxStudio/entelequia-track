import { apiFetch } from "@/app/lib/api";
import { usersEndpoints } from "./endpoints";
import type { User, CreateUserPayload } from "./types";

function validateEmail(email: string): void {
  // Basic email validation - backend will normalize to lowercase and enforce format/length
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
  if (email.length > 254) {
    throw new Error("Email too long (max 254 characters)");
  }
}

export async function createUser(input: CreateUserPayload): Promise<User> {
  const { user } = input;
  
  // Validate required fields
  if (!user.email?.trim()) {
    throw new Error("Email is required");
  }
  if (!user.role) {
    throw new Error("Role is required");
  }
  if (!user.password?.trim()) {
    throw new Error("Password is required for new users");
  }
  
  // Validate email format (backend will lowercase)
  validateEmail(user.email.trim());
  
  // Ensure active boolean is always sent
  const payload: CreateUserPayload = {
    user: {
      ...user,
      email: user.email.trim(),
      active: Boolean(user.active ?? true), // default to true if not specified
      password: user.password
    }
  };
  
  return apiFetch<User>(usersEndpoints.create(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
