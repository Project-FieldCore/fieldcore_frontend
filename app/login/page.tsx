'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { AuthBadge, AuthCard, AuthField, AuthShell, ErrorBanner, PasswordField, SubmitButton } from '@/components/auth/AuthUI';
import { IconArrowRight, IconMail } from '@/components/auth/AuthIcons';

/**
 * UC-01 — Autenticar usuário.
 * RN-001: só usuários ativos autenticam.
 * RN-003: a API é quem decide autorização de fato — o painel apenas evita
 * mostrar ações que o back-end rejeitaria.
 * RN-007: credenciais nunca aparecem em log — por isso o erro é sempre
 * genérico, sem indicar se o e-mail existe ou se foi a senha que errou.
 */
export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Sem chamada de rede real neste mock — o pequeno atraso só evita que o
    // botão "pisque" e deixa o estado de carregamento perceptível.
    window.setTimeout(() => {
      const result = login(email, senha);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.replace('/');
    }, 250);
  }

  return (
    <AuthShell>
      <AuthCard>
        <form onSubmit={handleSubmit}>
          <AuthBadge>Painel administrativo</AuthBadge>
          <h1 className="text-xl font-extrabold text-navy-900 mb-1">Entrar na sua conta</h1>
          <p className="text-sm text-slate-500 mb-6">Acesso restrito a administradores e supervisores.</p>

          <AuthField
            id="login-email"
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="voce@fieldcore.com"
            icon={<IconMail />}
            autoComplete="username"
            autoFocus
            required
          />

          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-navy-700 uppercase tracking-wide" htmlFor="login-senha">
              Senha
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-brandgreen-700 hover:text-brandgreen-800">
              Esqueci minha senha
            </Link>
          </div>
          <PasswordField id="login-senha" label="" value={senha} onChange={setSenha} autoComplete="current-password" last />

          {error && <ErrorBanner>{error}</ErrorBanner>}

          <SubmitButton loading={loading} loadingLabel="Entrando...">
            Entrar <IconArrowRight />
          </SubmitButton>

          <p className="text-center text-sm text-slate-500 mt-5">
            Não tem uma conta?{' '}
            <Link href="/signup" className="font-bold text-navy-800 hover:text-brandgreen-700">
              Solicitar acesso
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
