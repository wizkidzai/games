// See ScreenAttract.tsx for why sizes are expressed in vmin via this helper.
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

type ColorKey = 'peacock' | 'orchid' | 'fawn' | 'jay' | 'fox' | 'frog';

const COLORS: Record<ColorKey, string> = {
  peacock: 'var(--peacock-500)',
  orchid:  'var(--orchid-500)',
  fawn:    'var(--fawn-500)',
  jay:     'var(--jay-500)',
  fox:     'var(--fox-500)',
  frog:    'var(--frog-500)',
};

interface Props {
  value?: number;
  color?: ColorKey;
  height?: number;
}

export default function ProgressBar({ value = 0, color = 'peacock', height = 12 }: Props) {
  const fill = COLORS[color] ?? COLORS.peacock;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ width: '100%', height: vmin(height), background: 'var(--gray-100)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: fill, borderRadius: 'var(--radius-pill)', transition: 'width 360ms var(--ease-out)' }} />
    </div>
  );
}
