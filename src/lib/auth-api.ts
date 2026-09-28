import { http } from './http';
import type { User } from '@/types';

interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Contrato assumido para a API (ainda não implementada no backend):
 * POST /auth/login { email, senha } -> 200 { token, user } | 401 { message }
 * Ajustar este arquivo quando o contrato real do fieldcore_backend existir.
 */
export function login(email: string, senha: string): Promise<LoginResponse> {
  return http.post<LoginResponse>('/auth/login', { email, senha });
}
