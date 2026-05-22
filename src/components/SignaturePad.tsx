import React, { useRef, useState, useEffect } from 'react';
import { Eraser, CheckSquare } from 'lucide-react';

interface SignaturePadProps {
  onSave: (base64Png: string) => void;
  onClear?: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // deep blue stroke
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Fill canvas with white background so images aren't transparent
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Check if it's touch
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    onClear?.();
    onSave(''); // Clear active stored signature in parent form
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-1.5 px-1">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          Goreskan Paraf / Tanda Tangan Anda Disini:
        </span>
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-all active:scale-95"
          title="Hapus coretan untuk mengulang"
        >
          <Eraser className="w-3.5 h-3.5 mr-1" />
          Bersihkan
        </button>
      </div>

      <div className="relative w-full h-[120px] bg-white rounded-lg overflow-hidden border border-gray-350 shadow-inner cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={360}
          height={120}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full block touch-none"
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center pointer-events-none text-gray-300 font-mono text-[10px]">
            Gunakan mouse atau jari Anda untuk menulis paraf di panel ini
          </div>
        )}
      </div>

      {hasDrawn && (
        <div className="w-full flex items-center justify-end mt-1.5 text-[10px] text-emerald-600 font-semibold px-1">
          <CheckSquare className="w-3.5 h-3.5 mr-1 animate-pulse" />
          Paraf tersimpan sebagai data ter-enkripsi
        </div>
      )}
    </div>
  );
}
