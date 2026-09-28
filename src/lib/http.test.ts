import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NetworkError, http } from './http';
import { onUnauthorized, setAuthToken } from './auth-token';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('http', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setAuthToken(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('retorna o corpo já parseado quando a resposta é ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(200, { id: '1' }));

    const result = await http.get<{ id: string }>('/clients/1');

    expect(result).toEqual({ id: '1' });
  });

  it('retorna undefined em respostas 204', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    const result = await http.delete<undefined>('/clients/1');

    expect(result).toBeUndefined();
  });

  it('lança ApiError com status e mensagem da API quando a resposta não é ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(422, { message: 'Dados inválidos.' }));

    await expect(http.post('/clients', { nome: '' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      message: 'Dados inválidos.',
    });
  });

  it('lança NetworkError quando o fetch falha (sem conexão)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(http.get('/clients')).rejects.toBeInstanceOf(NetworkError);
  });

  it('anexa o token de sessão como Authorization quando presente', async () => {
    setAuthToken('token-123');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    global.fetch = fetchMock;

    await http.get('/me');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer token-123');
  });

  it('dispara notifyUnauthorized em 401 quando a requisição já levava token', async () => {
    setAuthToken('token-123');
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(401, { message: 'Sessão expirada.' }));
    const handler = vi.fn();
    onUnauthorized(handler);

    await expect(http.get('/me')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('não dispara notifyUnauthorized em 401 sem token (ex.: login com credenciais erradas)', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(401, { message: 'E-mail ou senha inválidos.' }));
    const handler = vi.fn();
    onUnauthorized(handler);

    await expect(http.post('/auth/login', { email: 'a@a.com', senha: 'x' })).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();
  });
});
