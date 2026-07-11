import type { BoardEntry } from '@wizkidz/leaderboard';

// See ScreenAttract.tsx for why sizes are expressed in vmin via this helper.
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

interface InitialSlot { ch: string; bg: string; bc: string; fg: string; }

interface Props {
  confettiPieces: ConfettiPiece[];
  resultTitle: string;
  gameTitle: string;
  finalScore: number;
  resultPhase: 'entry' | 'board';
  initials: string[];
  initSlot: number;
  board: BoardEntry[];
  savedName: string;
}

export interface ConfettiPiece {
  key: number; left: number; width: number; height: number;
  color: string; round: boolean; dur: number; delay: number;
}

export default function ScreenResult({
  confettiPieces, resultTitle, gameTitle, finalScore,
  resultPhase, initials, initSlot, board, savedName,
}: Props) {
  const slots: InitialSlot[] = initials.map((ch, i) => ({
    ch, bg: i === initSlot ? 'var(--fawn-100)' : 'var(--white)',
    bc: i === initSlot ? 'var(--fawn-500)' : i < initSlot ? 'var(--frog-500)' : 'var(--gray-100)',
    fg: 'var(--jet)',
  }));

  const boardRows = board.length
    ? board.map((r, i) => ({
        rank: ['🥇', '🥈', '🥉', '4', '5'][i] ?? String(i + 1),
        rankC: i < 3 ? 'var(--jet)' : 'var(--gray-400)',
        n: r.n, s: r.s.toLocaleString(),
        bg: r.n === savedName && r.s === finalScore ? 'var(--fawn-100)' : 'var(--gray-50)',
      }))
    : [{ rank: '—', rankC: 'var(--gray-400)', n: 'Be the first champion!', s: '', bg: 'var(--gray-50)' }];

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: `radial-gradient(${vmin(1100)} ${vmin(700)} at 50% -10%, rgba(10,164,235,0.3), transparent 70%), var(--peacock-500)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: `${vmin(50)} ${vmin(80)} ${vmin(160)}`, gap: vmin(30),
    }}>
      {/* confetti */}
      {confettiPieces.length > 0 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
          {confettiPieces.map(p => (
            <div key={p.key} style={{
              position: 'absolute', top: 0, left: p.left + '%',
              width: vmin(p.width), height: vmin(p.height), background: p.color,
              borderRadius: p.round ? '50%' : vmin(4),
              animation: `wkFall ${p.dur}s linear ${p.delay}s infinite`, opacity: 0,
            }} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vmin(8), zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(76), color: 'var(--fawn-500)', animation: 'wkPop 500ms var(--ease-bounce)', textAlign: 'center' }}>
          {resultTitle}
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: vmin(32), color: 'rgba(250,250,250,0.85)' }}>
          {gameTitle}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: vmin(60), zIndex: 1 }}>
        {/* score card */}
        <div style={{
          background: 'var(--surface-card)', borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)', padding: `${vmin(44)} ${vmin(80)}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vmin(8),
        }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: vmin(28), color: 'var(--text-muted)' }}>Your score</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(130), lineHeight: 1, color: 'var(--peacock-500)' }}>
            {finalScore.toLocaleString()}
          </div>
        </div>

        {/* initials entry */}
        {resultPhase === 'entry' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vmin(26), maxWidth: vmin(560) }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(42), color: 'var(--seasalt)', textAlign: 'center', animation: 'wkPulse 1.6s ease infinite' }}>
              🔥 New high score! Enter your name:
            </div>
            <div style={{ display: 'flex', gap: vmin(24) }}>
              {slots.map((sl, i) => (
                <div key={i} style={{
                  width: vmin(120), height: vmin(152), borderRadius: 'var(--radius-lg)',
                  background: sl.bg, border: `${vmin(7)} solid ${sl.bc}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(88), color: sl.fg,
                }}>
                  {sl.ch}
                </div>
              ))}
            </div>
            <div style={{ fontSize: vmin(28), fontWeight: 600, color: 'rgba(250,250,250,0.85)', textAlign: 'center' }}>
              ◀ ▶ change letter · big button to lock it in
            </div>
          </div>
        )}

        {/* leaderboard */}
        {resultPhase === 'board' && (
          <div style={{ width: vmin(580), background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: `${vmin(30)} ${vmin(40)}`, display: 'flex', flexDirection: 'column', gap: vmin(12) }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(30), color: 'var(--text-strong)', textAlign: 'center' }}>
              🏆 {gameTitle} — Top Wiz Kidz
            </div>
            {boardRows.map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: vmin(22), background: row.bg, borderRadius: 'var(--radius-md)', padding: `${vmin(10)} ${vmin(24)}` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(32), color: row.rankC, width: vmin(50) }}>{row.rank}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(32), color: 'var(--text-strong)', letterSpacing: '0.15em', flex: 1 }}>{row.n}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(32), color: 'var(--peacock-ink)' }}>{row.s}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ zIndex: 1, display: 'flex', gap: vmin(60), alignItems: 'center' }}>
        {resultPhase === 'board' && (
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: vmin(28), color: 'rgba(250,250,250,0.85)', textAlign: 'center' }}>
            Press any button to head back to the games!
          </div>
        )}
      </div>
    </div>
  );
}
