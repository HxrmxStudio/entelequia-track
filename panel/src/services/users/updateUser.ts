import { apiFetch } from "@/app/lib/api";
import { usersEndpoints } from "./endpoints";
import type { User, UpdateUserPayload } from "./types";

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

export async function updateUser(id: string, input: UpdateUserPayload): Promise<User> {
  const { user } = input;
  
  // Validate email if provided
  if (user.email && user.email.trim()) {
    validateEmail(user.email.trim());
  }
  
  // Ensure active boolean is always sent if present
  const payload: UpdateUserPayload = {
    user: {
      ...user,
      ...(user.email && { email: user.email.trim() }),
      ...(typeof user.active === "boolean" && { active: user.active })
    }
  };
  
  return apiFetch<User>(usersEndpoints.update(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
