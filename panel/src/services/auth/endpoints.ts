export const authEndpoints = {
  login: () => "/api/proxy/auth/login",
  refresh: () => "/api/proxy/auth/refresh",
  logout: () => "/api/proxy/auth/logout",
  register: () => "/api/proxy/auth/register"
} as const;


