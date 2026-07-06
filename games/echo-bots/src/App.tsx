/**
 * Echo Bots — Simon-style memory game.
 * Extracted from wizkidzboothgames/app/src/App.jsx (simon logic only).
 *
 * RFID: reads player UID on mount → tags Firebase leaderboard entry → done.
 * No session management, no hardware orchestration beyond that.
 */

import { Component, createRef } from 'react';
import { CONFIG } from './config';
import { Sfx } from './audio';
import { loadBoard, qualifies, saveEntry } from '@wizkidz/firebase-lb';
import type { BoardEntry } from '@wizkidz/firebase-lb';
import { tryReadPlayerUID, tryWriteScore } from './rfid';
import ScreenAttract from './components/ScreenAttract';
import ScreenSimon from './components/ScreenSimon';
import ScreenResult from './components/ScreenResult';
import type { ConfettiPiece } from './components/ScreenResult';
import ButtonLegend from './components/ButtonLegend';
import type { LegendButton } from './components/ButtonLegend';
import {
  BLUE, BLUE_D, RED, RED_D, YELLOW, YELLOW_D,
  PAD_COLORS, GAME_ID, GAME_TITLE, GAME_TAG, THEME_COLOR, MASCOT_SRC,
} from './data';

const STAGE_W = 1280, STAGE_H = 1080;

interface AppState {
  scale: number;
  screen: 'attract' | 'simon' | 'result';
  score: number;
  // simon state
  sSeq: number[];
  sPhase: 'watch' | 'repeat' | 'won' | 'fail';
  sLit: number;
  sInput: number;
  sRound: number;
  // result state
  finalScore: number;
  resultPhase: 'entry' | 'board';
  initials: string[];
  initSlot: number;
  savedName: string;
  board: BoardEntry[];
  confettiPieces: ConfettiPiece[];
  // RFID
  playerUID: string | null;
}

export default class App extends Component<Record<string, never>, AppState> {
  state: AppState = {
    scale: 1, screen: 'attract', score: 0,
    sSeq: [], sPhase: 'watch', sLit: -1, sInput: 0, sRound: 1,
    finalScore: 0, resultPhase: 'board',
    initials: ['A', 'A', 'A'], initSlot: 0, savedName: '',
    board: [], confettiPieces: [],
    playerUID: null,
  };

  gameRef = createRef<HTMLDivElement>();
  private sfx = new Sfx(() => CONFIG.soundOn);
  private _timeouts: ReturnType<typeof setTimeout>[] = [];
  private _tickIv?: ReturnType<typeof setInterval>;
  private _idleIv?: ReturnType<typeof setInterval>;
  private _lastInput = Date.now();

  componentDidMount() {
    this.fit();
    window.addEventListener('resize', this.fit);
    window.addEventListener('keydown', this.onKey);
    this._idleIv = setInterval(() => {
      if (this.state.screen !== 'attract' && Date.now() - this._lastInput > CONFIG.idleSeconds * 1000) {
        this.goAttract();
      }
    }, 1000);
    // RFID: read player UID silently; no-ops when hardware absent
    void tryReadPlayerUID().then(uid => { if (uid) this.setState({ playerUID: uid }); });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.fit);
    window.removeEventListener('keydown', this.onKey);
    clearInterval(this._idleIv);
    this.clearTimers();
  }

  fit = () => {
    const el = this.gameRef.current;
    const w = el?.clientWidth ?? window.innerWidth;
    const h = el?.clientHeight ?? window.innerHeight;
    const sc = Math.max(0.05, Math.min(w / STAGE_W, h / STAGE_H));
    if (sc !== this.state.scale) this.setState({ scale: sc });
  };

  onKey = (e: KeyboardEvent) => {
    this._lastInput = Date.now();
    const k = e.key;
    if (k === ' ' || k === 'Enter' || k === CONFIG.keyA) { e.preventDefault(); this.press('A'); }
    else if (k === 'ArrowLeft'  || k === CONFIG.keyB)    { e.preventDefault(); this.press('B'); }
    else if (k === 'ArrowRight' || k === CONFIG.keyC)    { e.preventDefault(); this.press('C'); }
  };

  after(ms: number, fn: () => void) {
    const t = setTimeout(fn, ms);
    this._timeouts.push(t);
    return t;
  }
  clearTimers() {
    this._timeouts.forEach(clearTimeout);
    this._timeouts = [];
    clearInterval(this._tickIv);
  }

  goAttract = () => { this.clearTimers(); this.setState({ screen: 'attract' }); };

  async endGame(score: number) {
    this.clearTimers();
    this.sfx.fanfare();
    const board = await loadBoard(GAME_ID);
    this.setState({
      screen: 'result', finalScore: score,
      resultPhase: qualifies(board, score) ? 'entry' : 'board',
      initials: ['A', 'A', 'A'], initSlot: 0, savedName: '', board,
      confettiPieces: this.buildConfetti(score > 0),
    });
  }

  buildConfetti(on: boolean): ConfettiPiece[] {
    if (!on) return [];
    const colors = [BLUE, RED, YELLOW, '#a30078', '#43a277', '#fafafa'];
    return Array.from({ length: 44 }, (_, i) => ({
      key: i, left: Math.random() * 100,
      width: 14 + Math.random() * 14, height: 10 + Math.random() * 10,
      color: colors[i % colors.length], round: Math.random() > 0.5,
      dur: 2.6 + Math.random() * 2.4, delay: Math.random() * 1.8,
    }));
  }

  startSimon() {
    this.clearTimers();
    this.setState({ screen: 'simon', score: 0, sSeq: [], sPhase: 'watch', sLit: -1, sInput: 0, sRound: 1 });
    this.after(900, () => this.simonNextRound());
  }

  simonNextRound() {
    const seq = this.state.sSeq.concat([Math.floor(Math.random() * 3)]);
    this.setState({ sSeq: seq, sPhase: 'watch', sInput: 0, sRound: seq.length, sLit: -1 });
    seq.forEach((pad, i) => {
      this.after(600 + i * 620, () => { this.sfx.pad(pad); this.setState({ sLit: pad }); });
      this.after(600 + i * 620 + 420, () => this.setState({ sLit: -1 }));
    });
    this.after(600 + seq.length * 620 + 100, () => this.setState({ sPhase: 'repeat' }));
  }

  simonPress(idx: number) {
    const s = this.state;
    if (s.sPhase !== 'repeat') return;
    this.sfx.pad(idx);
    this.setState({ sLit: idx });
    this.after(220, () => this.setState({ sLit: -1 }));
    if (idx === s.sSeq[s.sInput]) {
      const ni = s.sInput + 1;
      if (ni >= s.sSeq.length) {
        const sc = s.score + s.sSeq.length * 100;
        this.setState({ score: sc, sPhase: 'won' });
        this.after(350, () => this.sfx.good());
        if (s.sSeq.length >= 12) {
          this.after(900, () => { void this.endGame(this.state.score); });
        } else {
          this.after(1000, () => this.simonNextRound());
        }
      } else {
        this.setState({ sInput: ni });
      }
    } else {
      this.sfx.bad();
      this.setState({ sPhase: 'fail' });
      this.after(1300, () => { void this.endGame(this.state.score); });
    }
  }

  press = (btn: 'A' | 'B' | 'C') => {
    this._lastInput = Date.now();
    const { screen, resultPhase, initials, initSlot } = this.state;

    if (screen === 'attract') { this.sfx.good(); this.startSimon(); return; }

    if (screen === 'simon') {
      const map: Record<'A'|'B'|'C', number> = { B: 0, A: 1, C: 2 };
      this.simonPress(map[btn]);
      return;
    }

    if (screen === 'result') {
      if (resultPhase === 'entry') {
        if (btn === 'B' || btn === 'C') {
          const d = btn === 'B' ? -1 : 1;
          const next = [...initials];
          next[initSlot] = String.fromCharCode(((next[initSlot].charCodeAt(0) - 65 + d + 26) % 26) + 65);
          this.sfx.blip();
          this.setState({ initials: next });
        } else {
          this.sfx.good();
          if (initSlot >= 2) {
            const name = initials.join('');
            void saveEntry(GAME_ID, name, this.state.finalScore, this.state.playerUID ?? undefined).then(async () => {
              // RFID: write updated score to card (simplified — score tagging only)
              void tryWriteScore(this.state.finalScore);
              const board = await loadBoard(GAME_ID);
              this.setState({ resultPhase: 'board', savedName: name, board });
            });
          } else {
            this.setState({ initSlot: initSlot + 1 });
          }
        }
      } else {
        this.sfx.good();
        this.startSimon();
      }
      return;
    }
  };

  legendFor(): LegendButton[] {
    const B = (g: string, l: string): LegendButton => ({ c: BLUE, cDark: BLUE_D, g, l, size: 60, tap: () => this.press('B') });
    const A = (l: string): LegendButton => ({ c: RED, cDark: RED_D, g: '⬤', l, size: 76, tap: () => this.press('A') });
    const C = (g: string, l: string): LegendButton => ({ c: YELLOW, cDark: YELLOW_D, g, l, size: 60, tap: () => this.press('C') });
    const { screen, resultPhase } = this.state;
    if (screen === 'simon')  return [B('◀', ''), A('Repeat the pattern!'), C('▶', '')];
    if (screen === 'result') {
      if (resultPhase === 'entry') return [B('◀', 'Letter'), A('Lock it in'), C('▶', 'Letter')];
      return [A('Play again!')];
    }
    return [A('Press to play!')];
  }

  render() {
    const s = this.state;
    const scoreText = s.score.toLocaleString() + ' pts';
    const sStatus = s.sPhase === 'watch' ? '👀 Watch closely…'
      : s.sPhase === 'repeat' ? '🎵 Your turn!'
      : s.sPhase === 'won'   ? 'Perfect! ✨'
      : 'Oh no! Good game!';
    const sPads = PAD_COLORS.map((p, i) => {
      const lit = s.sLit === i;
      return {
        img: p.img, bg: lit ? p.bg : p.dim, scl: lit ? 1.09 : 1,
        glow: lit ? `0 0 70px ${p.bg}` : '0 10px 24px rgba(0,0,0,0.35)',
        tap: () => { this._lastInput = Date.now(); this.simonPress(i); },
      };
    });

    return (
      <div style={{ position: 'fixed', inset: 0, background: s.screen === 'attract' ? 'var(--peacock-500)' : 'var(--peacock-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: 'var(--font-body)', userSelect: 'none' }}>
        <div ref={this.gameRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ width: STAGE_W, height: STAGE_H, position: 'relative', overflow: 'hidden', transform: `scale(${s.scale})`, transformOrigin: 'center', flex: 'none' }}>

            {s.screen === 'attract' && (
              <ScreenAttract
                onPress={() => this.press('A')}
                gameTitle={GAME_TITLE}
                gameTag={GAME_TAG}
                mascotSrc={MASCOT_SRC}
                themeColor={THEME_COLOR}
              />
            )}

            {s.screen === 'simon' && (
              <ScreenSimon
                scoreText={scoreText}
                sRoundText={'Round ' + s.sRound}
                sStatus={sStatus}
                sPads={sPads}
              />
            )}

            {s.screen === 'result' && (
              <ScreenResult
                confettiPieces={s.confettiPieces}
                resultTitle={s.finalScore > 0 ? 'GREAT JOB!' : 'GOOD TRY!'}
                gameTitle={GAME_TITLE}
                finalScore={s.finalScore}
                resultPhase={s.resultPhase}
                initials={s.initials}
                initSlot={s.initSlot}
                board={s.board}
                savedName={s.savedName}
              />
            )}

            {s.screen !== 'attract' && <ButtonLegend legend={this.legendFor()} />}
          </div>
        </div>
      </div>
    );
  }
}
