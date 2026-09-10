/**
 * Ícones compartilhados entre as telas de autenticação (login, solicitar
 * acesso, recuperar senha) — mesmo traço/estilo usado no resto do painel.
 */

export const IconMail = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l8 6 8-6" />
  </svg>
);

export const IconLock = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 118 0v3" />
  </svg>
);

export const IconUser = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="8" r="3.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20a7.5 7.5 0 0115 0" />
  </svg>
);

export const IconEye = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.7a3 3 0 004.1 4.1M9.4 5.6A10.7 10.7 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a13.6 13.6 0 01-3.3 4.1M6.2 7.4A13.7 13.7 0 002.5 12S6 18.5 12 18.5a10 10 0 004-0.8" />
  </svg>
);

export const IconAlertCircle = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5m0 3.5h.01" />
  </svg>
);

export const IconCheckCircle = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);

export const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
  </svg>
);

export const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6l-6 6 6 6" />
  </svg>
);

export const IconSpinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-90" fill="currentColor" d="M21 12a9 9 0 00-9-9V0a12 12 0 0112 12h-3z" />
  </svg>
);

export const IconCheck = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const IconShield = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
  </svg>
);

export const IconUserCheck = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="10" cy="8" r="3.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20a6.5 6.5 0 0113 0M16 12l2 2 3.5-3.5" />
  </svg>
);
