import { tapOnce } from '@wizkidz/game-utils';
import ProgressBar from './ProgressBar';

// See ScreenAttract.tsx for why sizes are expressed in vmin via this helper.
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

export interface QuizOption {
  t: string; bg: string; scale: number;
  c: string; cDark: string; glyph: string; textC: string;
  pick: () => void;
}

interface Props {
  scoreText: string;
  timerPct: number;
  timeText: string;
  timeColor: string;
  quizProgress: string;
  quizQ: string;
  quizOpts: QuizOption[];
  quizFbShow: boolean;
  quizFbText: string;
  quizFbColor: string;
}

export default function ScreenQuiz({
  scoreText, timerPct, timeText, timeColor,
  quizProgress, quizQ, quizOpts, quizFbShow, quizFbText, quizFbColor,
}: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--seasalt)', display: 'flex', flexDirection: 'column', padding: `${vmin(36)} ${vmin(60)} ${vmin(160)}`, gap: vmin(24) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(46), color: 'var(--peacock-500)' }}>Robo Quiz</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(34), color: 'var(--seasalt)', background: 'var(--jet)', borderRadius: 'var(--radius-pill)', padding: `${vmin(10)} ${vmin(32)}` }}>{scoreText}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: vmin(24) }}>
        <div style={{ flex: 1 }}><ProgressBar value={timerPct} color="peacock" height={12} /></div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(34), color: timeColor, minWidth: vmin(90), textAlign: 'right' }}>{timeText}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: vmin(28), justifyContent: 'center' }}>
        <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', borderTop: `${vmin(8)} solid var(--peacock-500)`, boxShadow: 'var(--shadow-md)', padding: `${vmin(40)} ${vmin(60)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vmin(18) }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: vmin(24), color: 'var(--text-muted)' }}>{quizProgress}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: vmin(48), lineHeight: 1.15, color: 'var(--text-strong)', textAlign: 'center' }}>{quizQ}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: vmin(24) }}>
          {quizOpts.map((opt, i) => (
            <div key={i} {...tapOnce(opt.pick)} style={{ background: opt.bg, border: `${vmin(6)} solid ${opt.c}`, borderRadius: 'var(--radius-lg)', padding: `${vmin(26)} ${vmin(16)} ${vmin(24)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vmin(16), cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transform: `scale(${opt.scale})`, transition: 'transform 150ms var(--ease-bounce), background 150ms', touchAction: 'none' }}>
              <div style={{ width: vmin(58), height: vmin(58), borderRadius: '50%', background: opt.c, boxShadow: `0 ${vmin(6)} 0 ${opt.cDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', fontSize: vmin(24) }}>{opt.glyph}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(32), color: opt.textC, textAlign: 'center', lineHeight: 1.15 }}>{opt.t}</div>
            </div>
          ))}
        </div>
        <div style={{ height: vmin(56), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {quizFbShow && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(44), color: quizFbColor, animation: 'wkPop 300ms var(--ease-bounce)' }}>{quizFbText}</div>}
        </div>
      </div>
    </div>
  );
}
