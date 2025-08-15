export interface LoginRequest { 
  email: string; 
  password: string; 
  device?: string;
}

export interface LoginResponse {
  access_token: string;
  exp: number;
  token_type: "Bearer";
  user: { id: string; email: string; name?: string; role: string };
}

export interface RefreshResponse {
  access_token: string;
  exp: number;
  token_type: "Bearer";
  user: { id: string; email: string; name?: string; role: string };
}

export interface RegisterRequest { 
  email: string; 
  password: string; 
  name?: string;
  device?: string;
}

export interface RegisterResponse {
  access_token: string;
  exp: number;
  token_type: "Bearer";
  user: { id: string; email: string; name?: string; role: string };
}