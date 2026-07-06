import ProgressBar from './ProgressBar';

interface Props {
  scoreText: string;
  timerPct: number;
  timeText: string;
  timeColor: string;
  mStreakShow: boolean;
  mStreakText: string;
  mBorder: string;
  mExpr: string;
  onNo: () => void;
  onYes: () => void;
}

export default function ScreenMath({
  scoreText, timerPct, timeText, timeColor,
  mStreakShow, mStreakText, mBorder, mExpr, onNo, onYes,
}: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--seasalt)', display: 'flex', flexDirection: 'column', padding: '36px 60px 160px', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 46, color: 'var(--frog-600)' }}>Bubble Pop</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {mStreakShow && (
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, color: 'var(--fawn-ink)', background: 'var(--fawn-100)', borderRadius: 'var(--radius-pill)', padding: '10px 28px' }}>{mStreakText}</div>
          )}
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: 'var(--seasalt)', background: 'var(--jet)', borderRadius: 'var(--radius-pill)', padding: '10px 32px' }}>{scoreText}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1 }}><ProgressBar value={timerPct} color="frog" height={12} /></div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: timeColor, minWidth: 90, textAlign: 'right' }}>{timeText}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34 }}>
        <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: `8px solid ${mBorder}`, boxShadow: 'var(--shadow-md)', padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transition: 'border-color 150ms' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--text-muted)' }}>Is this right?</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 110, color: 'var(--text-strong)', letterSpacing: '0.02em' }}>{mExpr}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
          <div onClick={onNo} style={{ background: 'var(--jay-100)', border: '6px solid var(--jay-500)', borderRadius: 'var(--radius-lg)', padding: '30px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--jay-500)', boxShadow: '0 6px 0 var(--jay-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26 }}>◀</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 44, color: 'var(--jay-ink)' }}>Nope!</div>
          </div>
          <div onClick={onYes} style={{ background: 'var(--fawn-100)', border: '6px solid var(--fawn-500)', borderRadius: 'var(--radius-lg)', padding: '30px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--fawn-500)', boxShadow: '0 6px 0 var(--fawn-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26 }}>▶</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 44, color: 'var(--fawn-ink)' }}>Yes!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
