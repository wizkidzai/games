import type { CSSProperties } from 'react';

// See ScreenAttract.tsx for why sizes are expressed in vmin via this helper.
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

export interface LegendButton {
  c: string;     // background color
  cDark: string; // shadow color
  g: string;     // glyph / icon
  l: string;     // label
  size: number;  // circle diameter, in design-reference px (see vmin())
  tap: () => void;
}

interface Props {
  legend: LegendButton[];
}

export default function ButtonLegend({ legend }: Props) {
  const bar: CSSProperties = {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: vmin(120),
    background: 'var(--jet)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: vmin(60),
    zIndex: 40, boxShadow: `0 ${vmin(-10)} ${vmin(30)} rgba(0,0,0,0.2)`,
  };
  return (
    <div style={bar}>
      <img
        src="/marketing-assets/logo/wiz-kidz-logo-white-904x400.png"
        alt="Wiz Kidz"
        style={{ position: 'absolute', left: vmin(32), top: '50%', transform: 'translateY(-50%)', height: vmin(48) }}
      />
      {legend.map((b, i) => (
        <div key={i} onClick={b.tap} style={{ display: 'flex', alignItems: 'center', gap: vmin(16), cursor: 'pointer' }}>
          <div style={{
            width: vmin(b.size), height: vmin(b.size), borderRadius: '50%',
            background: b.c, boxShadow: `0 ${vmin(6)} 0 ${b.cDark}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.92)', fontSize: vmin(24), flex: 'none',
          }}>
            {b.g}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--seasalt)', fontSize: vmin(26) }}>
            {b.l}
          </div>
        </div>
      ))}
    </div>
  );
}
