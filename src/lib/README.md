# Cliente HTTP (`src/lib/http.ts`)

Wrapper único para todas as chamadas à API do FieldCore. Nenhum outro ponto do
código deve chamar `fetch`/`axios` diretamente — sempre importar `http` daqui.

## Configuração de ambiente

A base URL vem de `NEXT_PUBLIC_API_BASE_URL` (variável pública do Next.js,
precisa desse prefixo para chegar ao browser). Copie `.env.local.example` para
`.env.local` (não versionado) e ajuste por ambiente:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Sem essa variável, cai no default `http://localhost:8080/api` (uso local).

## Uso

```ts
import { http, ApiError, NetworkError } from '@/lib/http';

try {
  const client = await http.get<Client>(`/clients/${id}`);
} catch (error) {
  if (error instanceof ApiError) {
    // resposta da API com status de erro (4xx/5xx) — error.status, error.message, error.details
  } else if (error instanceof NetworkError) {
    // sem conexão ou timeout (15s por padrão) — error.message já em pt-BR, pronto para exibir
  }
}
```

Métodos disponíveis: `http.get`, `http.post`, `http.put`, `http.patch`, `http.delete`.

## Autenticação

- O token de sessão fica em `src/lib/auth-token.ts` (`sessionStorage`, fora do
  Zustand para evitar import circular com o próprio `http.ts`).
- `http.ts` anexa `Authorization: Bearer <token>` automaticamente quando há
  token salvo — não é preciso passar isso manualmente em cada chamada.
- Um `401` numa requisição que **já levava token** é tratado como sessão
  expirada: dispara `notifyUnauthorized()`, que o `app-store.ts` usa para
  deslogar o usuário. Um `401` sem token (ex.: login com credenciais erradas)
  não dispara isso — é só "credenciais inválidas".

## Testes

`src/lib/http.test.ts` cobre resposta ok, `204`, `ApiError`, `NetworkError`
(fetch falhando/timeout) e o disparo (ou não) de `notifyUnauthorized` em 401.
Rodar com `npm test`.
