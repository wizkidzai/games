import ProgressBar from './ProgressBar';

// See ScreenAttract.tsx for why sizes are expressed in vmin via this helper.
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

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
    <div style={{ position: 'absolute', inset: 0, background: 'var(--seasalt)', display: 'flex', flexDirection: 'column', padding: `${vmin(36)} ${vmin(60)} ${vmin(160)}`, gap: vmin(24) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(46), color: 'var(--frog-600)' }}>Math Pop</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: vmin(20) }}>
          {mStreakShow && (
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(28), color: 'var(--fawn-ink)', background: 'var(--fawn-100)', borderRadius: 'var(--radius-pill)', padding: `${vmin(10)} ${vmin(28)}` }}>{mStreakText}</div>
          )}
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(34), color: 'var(--seasalt)', background: 'var(--jet)', borderRadius: 'var(--radius-pill)', padding: `${vmin(10)} ${vmin(32)}` }}>{scoreText}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: vmin(24) }}>
        <div style={{ flex: 1 }}><ProgressBar value={timerPct} color="frog" height={12} /></div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(34), color: timeColor, minWidth: vmin(90), textAlign: 'right' }}>{timeText}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: vmin(34) }}>
        <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: `${vmin(8)} solid ${mBorder}`, boxShadow: 'var(--shadow-md)', padding: vmin(60), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vmin(14), transition: 'border-color 150ms' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: vmin(28), color: 'var(--text-muted)' }}>Is this right?</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(110), color: 'var(--text-strong)', letterSpacing: '0.02em' }}>{mExpr}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: vmin(30) }}>
          <div onClick={onNo} style={{ background: 'var(--jay-100)', border: `${vmin(6)} solid var(--jay-500)`, borderRadius: 'var(--radius-lg)', padding: `${vmin(30)} ${vmin(20)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: vmin(20), cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: vmin(58), height: vmin(58), borderRadius: '50%', background: 'var(--jay-500)', boxShadow: `0 ${vmin(6)} 0 var(--jay-600)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: vmin(26) }}>◀</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(44), color: 'var(--jay-ink)' }}>Nope!</div>
          </div>
          <div onClick={onYes} style={{ background: 'var(--fawn-100)', border: `${vmin(6)} solid var(--fawn-500)`, borderRadius: 'var(--radius-lg)', padding: `${vmin(30)} ${vmin(20)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: vmin(20), cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: vmin(58), height: vmin(58), borderRadius: '50%', background: 'var(--fawn-500)', boxShadow: `0 ${vmin(6)} 0 var(--fawn-600)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: vmin(26) }}>▶</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(44), color: 'var(--fawn-ink)' }}>Yes!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
