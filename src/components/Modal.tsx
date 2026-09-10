'use client';

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-navy-900/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl w-full ${wide ? 'max-w-lg' : 'max-w-md'} max-h-[85vh] overflow-y-auto p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-navy-900">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-slate-400 hover:text-navy-900 text-lg leading-none">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="text-xs font-bold text-navy-700 uppercase block mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
