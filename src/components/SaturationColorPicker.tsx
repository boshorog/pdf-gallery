import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaturationColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Helpers: HSV ↔ HEX
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

const SaturationColorPicker = ({ color, onChange }: SaturationColorPickerProps) => {
  const [hsv, setHsv] = useState<[number, number, number]>(() => {
    const rgb = hexToRgb(color);
    return rgbToHsv(...rgb);
  });
  const [hexInput, setHexInput] = useState(color);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const draggingSat = useRef(false);
  const draggingHue = useRef(false);

  // Sync external color changes
  useEffect(() => {
    const rgb = hexToRgb(color);
    const newHsv = rgbToHsv(...rgb);
    setHsv(newHsv);
    setHexInput(color);
  }, [color]);

  const emitColor = useCallback((h: number, s: number, v: number) => {
    const rgb = hsvToRgb(h, s, v);
    const hex = rgbToHex(...rgb);
    onChange(hex);
    setHexInput(hex);
  }, [onChange]);

  // Saturation/Value canvas interaction
  const handleSatCanvas = useCallback((e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const newS = x;
    const newV = 1 - y;
    setHsv([hsv[0], newS, newV]);
    emitColor(hsv[0], newS, newV);
  }, [hsv, emitColor]);

  // Hue slider interaction
  const handleHueSlider = useCallback((e: React.MouseEvent | MouseEvent) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newH = x * 360;
    setHsv([newH, hsv[1], hsv[2]]);
    emitColor(newH, hsv[1], hsv[2]);
  }, [hsv, emitColor]);

  // Mouse event handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingSat.current) handleSatCanvas(e);
      if (draggingHue.current) handleHueSlider(e);
    };
    const onUp = () => {
      draggingSat.current = false;
      draggingHue.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [handleSatCanvas, handleHueSlider]);

  const hueColor = `hsl(${hsv[0]}, 100%, 50%)`;

  return (
    <div className="space-y-4">
      {/* Saturation/Value Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-48 rounded-lg cursor-crosshair border border-border overflow-hidden"
        style={{ backgroundColor: hueColor }}
        onMouseDown={(e) => { draggingSat.current = true; handleSatCanvas(e); }}
      >
        {/* White gradient (left to right) */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #fff, transparent)' }} />
        {/* Black gradient (top to bottom) */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
        {/* Picker circle */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{
            left: `calc(${hsv[1] * 100}% - 8px)`,
            top: `calc(${(1 - hsv[2]) * 100}% - 8px)`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* Hue Slider */}
      <div
        ref={hueRef}
        className="relative w-full h-4 rounded-full cursor-pointer border border-border"
        style={{
          background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
        }}
        onMouseDown={(e) => { draggingHue.current = true; handleHueSlider(e); }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{
            left: `calc(${(hsv[0] / 360) * 100}% - 8px)`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)',
            backgroundColor: hueColor,
          }}
        />
      </div>

      {/* HEX input + preview */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border border-border flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1">
          <Label htmlFor="hex-input" className="text-xs text-muted-foreground">HEX</Label>
          <Input
            id="hex-input"
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                onChange(e.target.value);
              }
            }}
            className="font-mono h-8 text-sm"
            placeholder="#7FB3DC"
          />
        </div>
      </div>
    </div>
  );
};

export default SaturationColorPicker;
