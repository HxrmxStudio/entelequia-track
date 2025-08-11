import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { endpoints } from "@/services/http";

type AuthState = {
  token: string | null;
  userId: string | null;
  role: string | null;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const TOKEN_KEY = "auth-token";
const USER_ID_KEY = "auth-user-id";
const ROLE_KEY = "auth-role";

export const useAuthStore = create<AuthState>((set: (partial: Partial<AuthState>) => void) => ({
  token: null,
  userId: null,
  role: null,
  async login({ email, password }: { email: string; password: string }) {
    const result = await endpoints.login(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    // TODO: confirmar userId endpoint; using placeholder null until backend exposes it
    await SecureStore.setItemAsync(ROLE_KEY, result.role);
    set({ token: result.token, role: result.role });
  },
  async logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    await SecureStore.deleteItemAsync(ROLE_KEY);
    set({ token: null, userId: null, role: null });
  },
  async hydrate() {
    const [token, userId, role] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(USER_ID_KEY),
      SecureStore.getItemAsync(ROLE_KEY),
    ]);
    set({ token: token ?? null, userId: userId ?? null, role: role ?? null });
  },
}));


