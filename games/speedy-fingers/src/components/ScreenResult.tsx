import type { BoardEntry } from '@wizkidz/firebase-lb';

const BLUE   = '#0aa4eb', BLUE_D   = '#0888c4';
const RED    = '#ff4747', RED_D    = '#e62e2e';
const YELLOW = '#ffc832', YELLOW_D = '#e8ad12';

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
    bc: i === initSlot ? YELLOW : i < initSlot ? 'var(--frog-500)' : 'var(--gray-100)',
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
      background: 'radial-gradient(1100px 700px at 50% -10%, rgba(10,164,235,0.3), transparent 70%), var(--peacock-500)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '50px 80px 160px', gap: 30,
    }}>
      {/* confetti */}
      {confettiPieces.length > 0 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
          {confettiPieces.map(p => (
            <div key={p.key} style={{
              position: 'absolute', top: 0, left: p.left + '%',
              width: p.width, height: p.height, background: p.color,
              borderRadius: p.round ? '50%' : 4,
              animation: `wkFall ${p.dur}s linear ${p.delay}s infinite`, opacity: 0,
            }} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 76, color: 'var(--fawn-500)', animation: 'wkPop 500ms var(--ease-bounce)' }}>
          {resultTitle}
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 32, color: 'rgba(250,250,250,0.85)' }}>
          {gameTitle}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, zIndex: 1 }}>
        {/* score card */}
        <div style={{
          background: 'var(--surface-card)', borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)', padding: '44px 80px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--text-muted)' }}>Your score</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 130, lineHeight: 1, color: 'var(--peacock-500)' }}>
            {finalScore.toLocaleString()}
          </div>
        </div>

        {/* initials entry */}
        {resultPhase === 'entry' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, maxWidth: 560 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 42, color: 'var(--seasalt)', textAlign: 'center', animation: 'wkPulse 1.6s ease infinite' }}>
              🔥 New high score! Enter your name:
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {slots.map((sl, i) => (
                <div key={i} style={{
                  width: 120, height: 152, borderRadius: 'var(--radius-lg)',
                  background: sl.bg, border: `7px solid ${sl.bc}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 88, color: sl.fg,
                }}>
                  {sl.ch}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'rgba(250,250,250,0.85)', textAlign: 'center' }}>
              ◀ ▶ change letter · big button to lock it in
            </div>
          </div>
        )}

        {/* leaderboard */}
        {resultPhase === 'board' && (
          <div style={{ width: 580, background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 30, color: 'var(--text-strong)', textAlign: 'center' }}>
              🏆 {gameTitle} — Top Wiz Kidz
            </div>
            {boardRows.map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, background: row.bg, borderRadius: 'var(--radius-md)', padding: '10px 24px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, color: row.rankC, width: 50 }}>{row.rank}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32, color: 'var(--text-strong)', letterSpacing: '0.15em', flex: 1 }}>{row.n}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32, color: 'var(--peacock-ink)' }}>{row.s}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ zIndex: 1, display: 'flex', gap: 60, alignItems: 'center' }}>
        {resultPhase === 'board' && (
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, color: 'rgba(250,250,250,0.85)', textAlign: 'center' }}>
            Press the big button to play again!
          </div>
        )}
      </div>

      {/* legend hint */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 120,
        background: 'var(--jet)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60,
        zIndex: 40, boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
      }}>
        {resultPhase === 'entry' ? (
          <>
            <Btn c={BLUE} cD={BLUE_D} g="◀" l="Change letter" />
            <Btn c={RED} cD={RED_D} g="⬤" l="Lock it in" size={76} />
            <Btn c={YELLOW} cD={YELLOW_D} g="▶" l="Change letter" />
          </>
        ) : (
          <Btn c={RED} cD={RED_D} g="⬤" l="Play again!" size={76} />
        )}
      </div>
    </div>
  );
}

function Btn({ c, cD, g, l, size = 60 }: { c: string; cD: string; g: string; l: string; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: c, boxShadow: `0 6px 0 ${cD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.92)', fontSize: 24 }}>{g}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--seasalt)', fontSize: 26 }}>{l}</div>
    </div>
  );
}
