'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import {
  AuthBadge,
  AuthCard,
  AuthField,
  AuthShell,
  BackToLoginLink,
  ErrorBanner,
  PasswordField,
  SubmitButton,
  SuccessState,
} from '@/components/auth/AuthUI';
import { IconArrowRight, IconMail } from '@/components/auth/AuthIcons';

type Step = 'EMAIL' | 'SENT' | 'RESET' | 'DONE';

/**
 * Tela "Esqueci minha senha".
 * RN-007: a resposta nunca confirma se o e-mail existe na base — por isso a
 * etapa "SENT" usa sempre a mesma mensagem genérica, evitando enumeração de
 * contas. Como este protótipo não tem servidor de e-mail de verdade, a
 * etapa de redefinição fica disponível ali mesmo, claramente rotulada como
 * ambiente de demonstração — em produção isso viria de um link por e-mail.
 */
export default function ForgotPasswordPage() {
  const resetPassword = useAppStore((s) => s.resetPassword);

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSendInstructions(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep('SENT');
    }, 250);
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const result = resetPassword(email, novaSenha);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setStep('DONE');
    }, 250);
  }

  return (
    <AuthShell>
      <AuthCard>
        {step === 'EMAIL' && (
          <form onSubmit={handleSendInstructions}>
            <BackToLoginLink />
            <AuthBadge>Painel administrativo</AuthBadge>
            <h1 className="text-xl font-extrabold text-navy-900 mb-1">Esqueci minha senha</h1>
            <p className="text-sm text-slate-500 mb-6">
              Informe o e-mail da sua conta e enviaremos instruções de recuperação.
            </p>

            <AuthField
              id="forgot-email"
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="voce@fieldcore.com"
              icon={<IconMail />}
              autoComplete="email"
              autoFocus
              required
              last
            />

            <SubmitButton loading={loading} loadingLabel="Enviando...">
              Enviar instruções <IconArrowRight />
            </SubmitButton>
          </form>
        )}

        {step === 'SENT' && (
          <SuccessState
            title="Instruções enviadas"
            action={
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Ambiente de demonstração</p>
                  <p className="text-xs text-amber-700 leading-relaxed mb-3">
                    Este protótipo não envia e-mails de verdade. Em produção, o link chegaria na sua caixa de entrada —
                    aqui, simule a abertura dele:
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('RESET')}
                    className="w-full bg-white border border-amber-300 text-amber-800 rounded-lg py-2 text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    Simular link de redefinição
                  </button>
                </div>
                <Link href="/login" className="block text-sm font-bold text-navy-800 hover:text-brandgreen-700">
                  Voltar para o login
                </Link>
              </div>
            }
          >
            Se <strong className="text-navy-800">{email}</strong> estiver cadastrado, você vai receber um e-mail com um
            link para redefinir sua senha.
          </SuccessState>
        )}

        {step === 'RESET' && (
          <form onSubmit={handleReset}>
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setStep('SENT')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-700 transition-colors"
              >
                ← Voltar
              </button>
            </div>
            <AuthBadge>Painel administrativo</AuthBadge>
            <h1 className="text-xl font-extrabold text-navy-900 mb-1">Defina uma nova senha</h1>
            <p className="text-sm text-slate-500 mb-6">Escolha uma senha com pelo menos 6 caracteres.</p>

            <PasswordField
              id="forgot-nova-senha"
              label="Nova senha"
              value={novaSenha}
              onChange={setNovaSenha}
              autoComplete="new-password"
              autoFocus
            />
            <PasswordField
              id="forgot-confirmar-senha"
              label="Confirmar nova senha"
              value={confirmarSenha}
              onChange={setConfirmarSenha}
              autoComplete="new-password"
              last
            />

            {error && <ErrorBanner>{error}</ErrorBanner>}

            <SubmitButton loading={loading} loadingLabel="Salvando..." variant="green">
              Redefinir senha <IconArrowRight />
            </SubmitButton>
          </form>
        )}

        {step === 'DONE' && (
          <SuccessState
            title="Senha redefinida!"
            action={
              <Link href="/login" className="inline-flex w-full items-center justify-center gap-2 bg-navy-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-navy-800 transition-colors">
                Ir para o login
              </Link>
            }
          >
            Sua senha foi atualizada. Você já pode entrar com as novas credenciais.
          </SuccessState>
        )}
      </AuthCard>
    </AuthShell>
  );
}
