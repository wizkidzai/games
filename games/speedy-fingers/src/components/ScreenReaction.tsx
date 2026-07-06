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
        padding: '44px 60px 160px', cursor: 'pointer',
      }}
    >
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 46, color: 'var(--seasalt)' }}>Speedy Fingers</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {rDots.map((d, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: d.bg, border: '4px solid rgba(255,255,255,0.7)' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: 'var(--seasalt)', background: 'rgba(0,0,0,0.28)', borderRadius: 'var(--radius-pill)', padding: '10px 32px' }}>{scoreText}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80 }}>
        <div style={{ fontSize: 150, lineHeight: 1, transform: `translateY(${rocketY}px)`, transition: 'transform 500ms var(--ease-out)' }}>🚀</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30, maxWidth: 760 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 96, color: 'var(--seasalt)', lineHeight: 1.05, animation: rTextAnim }}>
            {rBigText}
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: 'rgba(250,250,250,0.9)', minHeight: 50 }}>{rSubText}</div>
        </div>
      </div>
    </div>
  );
}
