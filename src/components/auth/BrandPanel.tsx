import { IconCheck } from './AuthIcons';

/**
 * Painel de marca compartilhado por todas as telas de autenticação (login,
 * solicitar acesso, recuperar senha) — mantém exatamente o mesmo visual em
 * todas elas: gradiente navy, orbes suaves, grade de pontos, logo, proposta
 * de valor e a ilustração de relatório aprovado.
 */
export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[54%] xl:w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-900 via-navy-900 to-navy-700 text-white px-14 py-12 xl:px-20">
      {/* Fundo decorativo — orbes suaves + grade de pontos, tudo em CSS/SVG, sem assets externos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-24 -right-16 w-[26rem] h-[26rem] rounded-full bg-brandgreen-500/25 blur-3xl animate-drift" />
        <div
          className="absolute -bottom-32 -left-10 w-[22rem] h-[22rem] rounded-full bg-navy-600/50 blur-3xl animate-drift"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-full.png" alt="FieldCore — Inspeções em campo, resultados que conectam." className="h-24 w-auto xl:h-28" />
      </div>

      <div className="relative max-w-md">
        <p className="text-slate-300 text-[15px] leading-relaxed mb-8">
          Um único lugar para planejar, executar e revisar inspeções técnicas — do checklist do técnico à aprovação do supervisor.
        </p>

        <ul className="space-y-3.5">
          <FeatureItem>Checklist dinâmico com fotos e QR Code</FeatureItem>
          <FeatureItem>Funciona offline e sincroniza sem duplicidade</FeatureItem>
          <FeatureItem>Aprovação, não conformidades e auditoria centralizadas</FeatureItem>
        </ul>
      </div>

      <div className="relative">
        <ReportStackIllustration />
      </div>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm text-slate-200">
      <span className="shrink-0 w-5 h-5 rounded-full bg-brandgreen-500/20 text-brandgreen-400 flex items-center justify-center">
        <IconCheck />
      </span>
      {children}
    </li>
  );
}

/** Ilustração abstrata — pilha de relatórios de inspeção com um item aprovado. Só decorativa. */
function ReportStackIllustration() {
  return (
    <svg width="220" height="112" viewBox="0 0 220 112" fill="none" aria-hidden="true" className="opacity-90">
      <rect x="18" y="34" width="150" height="66" rx="12" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.12" />
      <rect x="8" y="20" width="150" height="66" rx="12" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.16" />
      <rect x="0" y="6" width="150" height="66" rx="12" fill="#16305A" stroke="#5CA83F" strokeOpacity="0.6" />
      <circle cx="20" cy="26" r="9" fill="#5CA83F" fillOpacity="0.18" />
      <path d="M16.5 26l2.5 2.5 5-5" stroke="#5CA83F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="36" y="20" width="72" height="6" rx="3" fill="white" fillOpacity="0.55" />
      <rect x="36" y="32" width="48" height="5" rx="2.5" fill="white" fillOpacity="0.28" />
      <rect x="12" y="46" width="126" height="1" fill="white" fillOpacity="0.14" />
      <rect x="12" y="54" width="60" height="5" rx="2.5" fill="white" fillOpacity="0.4" />
      <rect x="12" y="64" width="90" height="5" rx="2.5" fill="white" fillOpacity="0.22" />
      <g transform="translate(190, 18)">
        <rect x="0" y="0" width="26" height="26" rx="7" fill="#5CA83F" />
        <path d="M6 13.5l4.5 4.5L20 8" stroke="#0F2444" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
