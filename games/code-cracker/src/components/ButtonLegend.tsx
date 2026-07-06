import type { CSSProperties } from 'react';

export interface LegendButton {
  c: string;     // background color
  cDark: string; // shadow color
  g: string;     // glyph / icon
  l: string;     // label
  size: number;  // circle diameter px
  tap: () => void;
}

interface Props {
  legend: LegendButton[];
}

export default function ButtonLegend({ legend }: Props) {
  const bar: CSSProperties = {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 120,
    background: 'var(--jet)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60,
    zIndex: 40, boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
  };
  return (
    <div style={bar}>
      {legend.map((b, i) => (
        <div key={i} onClick={b.tap} style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
          <div style={{
            width: b.size, height: b.size, borderRadius: '50%',
            background: b.c, boxShadow: `0 6px 0 ${b.cDark}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.92)', fontSize: 24, flex: 'none',
          }}>
            {b.g}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--seasalt)', fontSize: 26 }}>
            {b.l}
          </div>
        </div>
      ))}
    </div>
  );
}
