// Converte hex (#rrggbb) para HSL — usado só para interpolar a escala de cor.
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// As mesmas duas cores usadas em --temp-cold/--temp-hot no CSS.
const COLD = hexToHsl('#5aa9e6'); // ~205°, azul frio
const HOT = hexToHsl('#e8703a'); // ~19°, laranja quente

const MIN_TEMP = -15;
const MAX_TEMP = 42;

/**
 * Mapeia uma temperatura (°C) para uma cor na escala fria→quente.
 * O matiz decresce de propósito de ~205° até ~19° (em vez do caminho
 * mais curto, que passaria por roxo/magenta) — assim a escala atravessa
 * verde e amarelo no meio, como um mapa meteorológico clássico.
 */
export function temperatureColor(tempC) {
  if (tempC === null || tempC === undefined || Number.isNaN(tempC)) {
    return 'var(--ink-muted)';
  }
  const t = Math.max(0, Math.min(1, (tempC - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)));
  const hue = COLD.h - t * (COLD.h - HOT.h);
  const sat = COLD.s + t * (HOT.s - COLD.s);
  const light = COLD.l + t * (HOT.l - COLD.l);
  return `hsl(${hue.toFixed(1)}, ${sat.toFixed(0)}%, ${light.toFixed(0)}%)`;
}
