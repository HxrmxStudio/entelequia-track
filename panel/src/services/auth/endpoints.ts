export const authEndpoints = {
  login: () => "/auth/login",
  refresh: () => "/auth/refresh",
  logout: () => "/auth/logout",
  register: () => "/auth/register"
} as const;


