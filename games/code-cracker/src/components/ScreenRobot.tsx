import { pressOnce, tapOnce } from '@wizkidz/game-utils';
import ProgressBar from './ProgressBar';

// See ScreenAttract.tsx for why sizes are expressed in vmin via this helper.
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

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
  onGoDown: () => void;
  onGoUp: () => void;
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
  rbProgSlots, onUndo, onAddL, onAddF, onAddR, onGoDown, onGoUp, rbGoBg, rbGoShadow, rbGoText,
  rbCells, rbTransform, rbShakeAnim, rbFlashShow, rbFlashText,
}: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--seasalt)', display: 'flex', flexDirection: 'column', padding: `${vmin(36)} ${vmin(60)} ${vmin(150)}`, gap: vmin(20) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(46), color: 'var(--fawn-ink)' }}>Code Cracker</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(34), color: 'var(--seasalt)', background: 'var(--jet)', borderRadius: 'var(--radius-pill)', padding: `${vmin(10)} ${vmin(32)}` }}>{scoreText}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: vmin(24) }}>
        <div style={{ flex: 1 }}><ProgressBar value={timerPct} color="fawn" height={12} /></div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(34), color: timeColor, minWidth: vmin(90), textAlign: 'right' }}>{timeText}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: vmin(44) }}>
        {/* left panel — program builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: vmin(16), width: vmin(540), flex: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: vmin(14) }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(26), color: 'var(--peacock-ink)', background: 'var(--peacock-50)', borderRadius: 'var(--radius-pill)', padding: `${vmin(10)} ${vmin(26)}`, flex: 'none' }}>{rbLevelText}</div>
            <div style={{ fontSize: vmin(23), fontWeight: 600, color: 'var(--text-body)' }}>Program the robot to the ⭐ · 🔋 = +50</div>
          </div>
          <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: `${vmin(18)} ${vmin(20)}`, display: 'flex', flexDirection: 'column', gap: vmin(12) }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(24), color: 'var(--text-strong)' }}>🧩 Your code</div>
              <div {...tapOnce(onUndo)} style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(20), color: 'var(--text-muted)', background: 'var(--gray-50)', border: `${vmin(2)} solid var(--gray-200)`, borderRadius: 'var(--radius-pill)', padding: `${vmin(6)} ${vmin(20)}`, cursor: 'pointer', touchAction: 'none' }}>⌫ Undo</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: vmin(8) }}>
              {rbProgSlots.map((ps, i) => (
                <div key={i} style={{ height: vmin(60), borderRadius: vmin(12), background: ps.bg, border: `${vmin(3)} ${ps.bs} ${ps.bc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: vmin(26), fontWeight: 800, color: ps.fg, transform: `scale(${ps.scl})`, transition: 'transform 150ms var(--ease-bounce), background 150ms' }}>
                  {ps.icon}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: vmin(12) }}>
            {[
              { label: 'Turn left', icon: '↺', onClick: onAddL, bg: 'var(--jay-100)', border: 'var(--jay-500)', ink: 'var(--jay-ink)' },
              { label: 'Forward',   icon: '▲', onClick: onAddF, bg: 'var(--frog-100)', border: 'var(--frog-500)', ink: 'var(--frog-ink)' },
              { label: 'Turn right',icon: '↻', onClick: onAddR, bg: 'var(--fawn-100)', border: 'var(--fawn-500)', ink: 'var(--fawn-ink)' },
            ].map(b => (
              <div key={b.label} {...tapOnce(b.onClick)} style={{ height: vmin(86), borderRadius: 'var(--radius-md)', background: b.bg, border: `${vmin(4)} solid ${b.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: vmin(2), cursor: 'pointer', boxShadow: 'var(--shadow-xs)', touchAction: 'none' }}>
                <div style={{ fontSize: vmin(30), lineHeight: 1, color: b.ink }}>{b.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(18), color: b.ink }}>{b.label}</div>
              </div>
            ))}
          </div>
          <div
            {...pressOnce(onGoDown, onGoUp)}
            style={{ minHeight: vmin(84), borderRadius: 'var(--radius-pill)', background: rbGoBg, boxShadow: `0 ${vmin(8)} 0 ${rbGoShadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 150ms', padding: `${vmin(10)} ${vmin(24)}`, touchAction: 'none' }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(26), lineHeight: 1.2, color: 'var(--seasalt)', textAlign: 'center' }}>{rbGoText}</div>
          </div>
        </div>

        {/* right panel — grid */}
        <div style={{ position: 'relative', width: vmin(560), height: vmin(560), background: 'var(--peacock-50)', borderRadius: 'var(--radius-lg)', padding: vmin(10), boxShadow: 'var(--shadow-md)', animation: rbShakeAnim, flex: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(5, ${vmin(108)})`, gridTemplateRows: `repeat(5, ${vmin(108)})`, position: 'relative' }}>
            {rbCells.map((cell, i) => (
              <div key={i} style={{ width: vmin(108), height: vmin(108), borderRadius: vmin(12), background: cell.bg, border: `${vmin(3)} solid ${cell.bc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: vmin(54) }}>
                {cell.icon}
              </div>
            ))}
            <img
              src="/marketing-assets/mascots/fawn.png"
              alt="robot"
              style={{ position: 'absolute', width: vmin(84), height: vmin(84), objectFit: 'contain', left: vmin(12), top: vmin(12), transform: rbTransform, transition: 'transform 200ms var(--ease-out)', zIndex: 5 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          {rbFlashShow && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,100,100,0.82)', borderRadius: 'var(--radius-lg)', zIndex: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(70), color: 'var(--fawn-500)', animation: 'wkPop 400ms var(--ease-bounce)' }}>{rbFlashText}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
