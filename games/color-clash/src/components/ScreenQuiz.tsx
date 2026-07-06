import ProgressBar from './ProgressBar';

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
    <div style={{ position: 'absolute', inset: 0, background: 'var(--seasalt)', display: 'flex', flexDirection: 'column', padding: '36px 60px 160px', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 46, color: 'var(--peacock-500)' }}>Color Clash</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: 'var(--seasalt)', background: 'var(--jet)', borderRadius: 'var(--radius-pill)', padding: '10px 32px' }}>{scoreText}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1 }}><ProgressBar value={timerPct} color="peacock" height={12} /></div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: timeColor, minWidth: 90, textAlign: 'right' }}>{timeText}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28, justifyContent: 'center' }}>
        <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', borderTop: '8px solid var(--peacock-500)', boxShadow: 'var(--shadow-md)', padding: '40px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--text-muted)' }}>{quizProgress}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, lineHeight: 1.15, color: 'var(--text-strong)', textAlign: 'center' }}>{quizQ}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {quizOpts.map((opt, i) => (
            <div key={i} onClick={opt.pick} style={{ background: opt.bg, border: `6px solid ${opt.c}`, borderRadius: 'var(--radius-lg)', padding: '26px 16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transform: `scale(${opt.scale})`, transition: 'transform 150ms var(--ease-bounce), background 150ms' }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: opt.c, boxShadow: `0 6px 0 ${opt.cDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 24 }}>{opt.glyph}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32, color: opt.textC, textAlign: 'center', lineHeight: 1.15 }}>{opt.t}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {quizFbShow && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 44, color: quizFbColor, animation: 'wkPop 300ms var(--ease-bounce)' }}>{quizFbText}</div>}
        </div>
      </div>
    </div>
  );
}
