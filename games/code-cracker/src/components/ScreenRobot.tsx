import ProgressBar from './ProgressBar';

export interface ProgramSlot {
  icon: string; bg: string; bc: string; bs: string; fg: string; scl: number;
}
export interface GridCell {
  bg: string; bc: string; icon: string;
}

interface Props {
  scoreText: string;
  timerPct: number;
  timeText: string;
  timeColor: string;
  rbLevelText: string;
  rbProgSlots: ProgramSlot[];
  onUndo: () => void;
  onAddL: () => void;
  onAddF: () => void;
  onAddR: () => void;
  onGo: () => void;
  rbGoBg: string;
  rbGoShadow: string;
  rbGoText: string;
  rbCells: GridCell[];
  rbTransform: string;
  rbShakeAnim: string;
  rbFlashShow: boolean;
  rbFlashText: string;
}

export default function ScreenRobot({
  scoreText, timerPct, timeText, timeColor, rbLevelText,
  rbProgSlots, onUndo, onAddL, onAddF, onAddR, onGo, rbGoBg, rbGoShadow, rbGoText,
  rbCells, rbTransform, rbShakeAnim, rbFlashShow, rbFlashText,
}: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--seasalt)', display: 'flex', flexDirection: 'column', padding: '36px 60px 150px', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 46, color: 'var(--fawn-ink)' }}>Code Cracker</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: 'var(--seasalt)', background: 'var(--jet)', borderRadius: 'var(--radius-pill)', padding: '10px 32px' }}>{scoreText}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1 }}><ProgressBar value={timerPct} color="fawn" height={12} /></div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: timeColor, minWidth: 90, textAlign: 'right' }}>{timeText}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        {/* left panel — program builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 540, flex: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--peacock-ink)', background: 'var(--peacock-50)', borderRadius: 'var(--radius-pill)', padding: '10px 26px', flex: 'none' }}>{rbLevelText}</div>
            <div style={{ fontSize: 23, fontWeight: 600, color: 'var(--text-body)' }}>Program the robot to the ⭐ · 🔋 = +50</div>
          </div>
          <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, color: 'var(--text-strong)' }}>🧩 Your code</div>
              <div onClick={onUndo} style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--text-muted)', background: 'var(--gray-50)', border: '2px solid var(--gray-200)', borderRadius: 'var(--radius-pill)', padding: '6px 20px', cursor: 'pointer' }}>⌫ Undo</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {rbProgSlots.map((ps, i) => (
                <div key={i} style={{ height: 60, borderRadius: 12, background: ps.bg, border: `3px ${ps.bs} ${ps.bc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: ps.fg, transform: `scale(${ps.scl})`, transition: 'transform 150ms var(--ease-bounce), background 150ms' }}>
                  {ps.icon}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Turn left', icon: '↺', onClick: onAddL, bg: 'var(--jay-100)', border: 'var(--jay-500)', ink: 'var(--jay-ink)' },
              { label: 'Forward',   icon: '▲', onClick: onAddF, bg: 'var(--frog-100)', border: 'var(--frog-500)', ink: 'var(--frog-ink)' },
              { label: 'Turn right',icon: '↻', onClick: onAddR, bg: 'var(--fawn-100)', border: 'var(--fawn-500)', ink: 'var(--fawn-ink)' },
            ].map(b => (
              <div key={b.label} onClick={b.onClick} style={{ height: 86, borderRadius: 'var(--radius-md)', background: b.bg, border: `4px solid ${b.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 30, lineHeight: 1, color: b.ink }}>{b.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: b.ink }}>{b.label}</div>
              </div>
            ))}
          </div>
          <div onClick={onGo} style={{ height: 84, borderRadius: 'var(--radius-pill)', background: rbGoBg, boxShadow: `0 8px 0 ${rbGoShadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 150ms' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 34, color: 'var(--seasalt)' }}>{rbGoText}</div>
          </div>
        </div>

        {/* right panel — grid */}
        <div style={{ position: 'relative', width: 560, height: 560, background: 'var(--peacock-50)', borderRadius: 'var(--radius-lg)', padding: 10, boxShadow: 'var(--shadow-md)', animation: rbShakeAnim, flex: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 108px)', gridTemplateRows: 'repeat(5, 108px)', position: 'relative' }}>
            {rbCells.map((cell, i) => (
              <div key={i} style={{ width: 108, height: 108, borderRadius: 12, background: cell.bg, border: `3px solid ${cell.bc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54 }}>
                {cell.icon}
              </div>
            ))}
            <img
              src="/marketing-assets/mascots/fawn.png"
              alt="robot"
              style={{ position: 'absolute', width: 84, height: 84, objectFit: 'contain', left: 12, top: 12, transform: rbTransform, transition: 'transform 200ms var(--ease-out)', zIndex: 5 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          {rbFlashShow && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,100,100,0.82)', borderRadius: 'var(--radius-lg)', zIndex: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 70, color: 'var(--fawn-500)', animation: 'wkPop 400ms var(--ease-bounce)' }}>{rbFlashText}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
