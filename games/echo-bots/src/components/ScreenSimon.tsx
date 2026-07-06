export interface SimonPad {
  img: string;
  bg: string;
  scl: number;
  glow: string;
  tap: () => void;
}

interface Props {
  scoreText: string;
  sRoundText: string;
  sStatus: string;
  sPads: SimonPad[];
}

export default function ScreenSimon({ scoreText, sRoundText, sStatus, sPads }: Props) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'var(--peacock-800)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '44px 60px 160px',
    }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 46, color: 'var(--seasalt)' }}>
          Echo Bots
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, color: 'var(--fawn-500)', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-pill)', padding: '10px 28px' }}>
            {sRoundText}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: 'var(--seasalt)', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-pill)', padding: '10px 32px' }}>
            {scoreText}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 64, color: 'var(--seasalt)', textAlign: 'center', minHeight: 80 }}>
          {sStatus}
        </div>
        <div style={{ display: 'flex', gap: 50, alignItems: 'center' }}>
          {sPads.map((p, i) => (
            <div
              key={i}
              onClick={p.tap}
              style={{
                width: 240, height: 240, borderRadius: '50%', background: p.bg, boxShadow: p.glow,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden',
                transform: `scale(${p.scl})`, transition: 'transform 120ms var(--ease-out), background 120ms, box-shadow 120ms',
                cursor: 'pointer', border: '9px solid rgba(255,255,255,0.25)',
              }}
            >
              <img
                src={p.img}
                alt={`pad ${i}`}
                style={{ width: 165, display: 'block' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, color: 'rgba(250,250,250,0.75)', textAlign: 'center' }}>
          Left · Big button · Right — match the flashing bots!
        </div>
      </div>
    </div>
  );
}
