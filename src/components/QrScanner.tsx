'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

/**
 * Modal de leitura de QR Code via câmera do dispositivo (getUserMedia + jsQR).
 * Usado para confirmar o equipamento correto antes de responder o checklist.
 */
export function QrScanner({ onScan, onClose }: { onScan: (data: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Este dispositivo/navegador não suporta acesso à câmera.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          tick();
        }
      } catch {
        setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            onScan(code.data);
            return;
          }
        }
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-navy-900/80 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5">
        <h3 className="font-extrabold text-navy-900 mb-1">Escanear QR Code</h3>
        <p className="text-xs text-slate-500 mb-3">Aponte a câmera para o QR Code fixado no equipamento.</p>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-3">{error}</div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-navy-900 aspect-square mb-3">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-6 border-2 border-brandgreen-500 rounded-xl pointer-events-none" />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        <button onClick={onClose} className="w-full bg-white border border-slate-300 rounded-xl py-2.5 font-bold text-navy-800">
          Cancelar
        </button>
      </div>
    </div>
  );
}
