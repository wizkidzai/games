// See ScreenAttract.tsx for why sizes are expressed in vmin via this helper.
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

interface Dot { bg: string; }

interface Props {
  onPress: () => void;
  rBg: string;
  scoreText: string;
  rDots: Dot[];
  rocketY: number;
  rBigText: string;
  rSubText: string;
  rTextAnim: string;
}

export default function ScreenReaction({ onPress, rBg, scoreText, rDots, rocketY, rBigText, rSubText, rTextAnim }: Props) {
  return (
    <div
      onClick={onPress}
      style={{
        position: 'absolute', inset: 0, background: rBg, transition: 'background 150ms',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: `${vmin(44)} ${vmin(60)} ${vmin(160)}`, cursor: 'pointer',
      }}
    >
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(46), color: 'var(--seasalt)' }}>Blast Off</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: vmin(26) }}>
          <div style={{ display: 'flex', gap: vmin(14) }}>
            {rDots.map((d, i) => (
              <div key={i} style={{ width: vmin(32), height: vmin(32), borderRadius: '50%', background: d.bg, border: `${vmin(4)} solid rgba(255,255,255,0.7)` }} />
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(34), color: 'var(--seasalt)', background: 'rgba(0,0,0,0.28)', borderRadius: 'var(--radius-pill)', padding: `${vmin(10)} ${vmin(32)}` }}>{scoreText}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: vmin(80) }}>
        <div style={{ fontSize: vmin(150), lineHeight: 1, transform: `translateY(${vmin(rocketY)})`, transition: 'transform 500ms var(--ease-out)' }}>🚀</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: vmin(30), maxWidth: vmin(760) }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(96), color: 'var(--seasalt)', lineHeight: 1.05, animation: rTextAnim }}>
            {rBigText}
          </div>
          <div style={{ fontSize: vmin(34), fontWeight: 600, color: 'rgba(250,250,250,0.9)', minHeight: vmin(50) }}>{rSubText}</div>
        </div>
      </div>
    </div>
  );
}
