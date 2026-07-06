/**
 * Speedy Fingers — reaction-time game.
 * Extracted from wizkidzboothgames/app/src/App.jsx (reaction logic only).
 */

import { Component, createRef } from 'react';
import { CONFIG } from './config';
import { Sfx } from './audio';
import { loadBoard, qualifies, saveEntry } from '@wizkidz/leaderboard';
import type { BoardEntry } from '@wizkidz/leaderboard';
import { tryReadPlayerUID, tryWriteScore } from './rfid';
import ScreenAttract from './components/ScreenAttract';
import ScreenReaction from './components/ScreenReaction';
import ScreenResult from './components/ScreenResult';
import type { ConfettiPiece } from './components/ScreenResult';
import ButtonLegend from './components/ButtonLegend';
import type { LegendButton } from './components/ButtonLegend';
import { BLUE, BLUE_D, RED, RED_D, YELLOW, YELLOW_D, GAME_ID, GAME_TITLE, GAME_TAG, THEME_COLOR, MASCOT_SRC } from './data';

const STAGE_W = 1280, STAGE_H = 1080;

type RPhase = 'intro' | 'wait' | 'go' | 'hit' | 'early';

interface AppState {
  scale: number;
  screen: 'attract' | 'reaction' | 'result';
  score: number;
  rRound: number;
  rPhase: RPhase;
  rMs: number;
  rResults: number[];
  finalScore: number;
  resultPhase: 'entry' | 'board';
  initials: string[];
  initSlot: number;
  savedName: string;
  board: BoardEntry[];
  confettiPieces: ConfettiPiece[];
  playerUID: string | null;
}

export default class App extends Component<Record<string, never>, AppState> {
  state: AppState = {
    scale: 1, screen: 'attract', score: 0,
    rRound: 0, rPhase: 'intro', rMs: 0, rResults: [],
    finalScore: 0, resultPhase: 'board',
    initials: ['A', 'A', 'A'], initSlot: 0, savedName: '',
    board: [], confettiPieces: [],
    playerUID: null,
  };

  gameRef = createRef<HTMLDivElement>();
  private sfx = new Sfx(() => CONFIG.soundOn);
  private _timeouts: ReturnType<typeof setTimeout>[] = [];
  private _idleIv?: ReturnType<typeof setInterval>;
  private _lastInput = Date.now();
  private _goAt = 0;

  componentDidMount() {
    this.fit();
    window.addEventListener('resize', this.fit);
    window.addEventListener('keydown', this.onKey);
    this._idleIv = setInterval(() => {
      if (this.state.screen !== 'attract' && Date.now() - this._lastInput > CONFIG.idleSeconds * 1000) this.goAttract();
    }, 1000);
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
    else if (k === 'ArrowLeft'  || k === CONFIG.keyB)   { e.preventDefault(); this.press('B'); }
    else if (k === 'ArrowRight' || k === CONFIG.keyC)   { e.preventDefault(); this.press('C'); }
  };

  after(ms: number, fn: () => void) { const t = setTimeout(fn, ms); this._timeouts.push(t); return t; }
  clearTimers() { this._timeouts.forEach(clearTimeout); this._timeouts = []; }
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

  startReaction() {
    this.clearTimers();
    this.setState({ screen: 'reaction', score: 0, rRound: 0, rResults: [], rPhase: 'intro' });
    this.after(1600, () => this.reactNextRound());
  }

  reactNextRound() {
    const round = this.state.rRound + 1;
    if (round > 5) { void this.endGame(this.state.score); return; }
    this.setState({ rRound: round, rPhase: 'wait' });
    this._goAt = 0;
    this.after(1200 + Math.random() * 2300, () => {
      if (this.state.rPhase === 'wait') {
        this._goAt = Date.now();
        this.sfx.go();
        this.setState({ rPhase: 'go' });
      }
    });
  }

  reactPress() {
    const s = this.state;
    if (s.rPhase === 'wait') {
      this.sfx.bad();
      this.setState({ rPhase: 'early', rResults: s.rResults.concat([0]) });
      this.after(1400, () => this.reactNextRound());
    } else if (s.rPhase === 'go') {
      const ms = Date.now() - this._goAt;
      const pts = ms <= 1000 ? Math.max(100, 1000 - ms) : 50;
      this.sfx.good();
      this.setState({ rPhase: 'hit', rMs: ms, score: s.score + pts, rResults: s.rResults.concat([pts]) });
      this.after(1500, () => this.reactNextRound());
    }
  }

  press = (btn: 'A' | 'B' | 'C') => {
    this._lastInput = Date.now();
    const { screen, resultPhase, initials, initSlot } = this.state;
    if (screen === 'attract') { this.sfx.good(); this.startReaction(); return; }
    if (screen === 'reaction') { if (btn === 'A') this.reactPress(); return; }
    if (screen === 'result') {
      if (resultPhase === 'entry') {
        if (btn === 'B' || btn === 'C') {
          const d = btn === 'B' ? -1 : 1;
          const next = [...initials];
          next[initSlot] = String.fromCharCode(((next[initSlot].charCodeAt(0) - 65 + d + 26) % 26) + 65);
          this.sfx.blip(); this.setState({ initials: next });
        } else {
          this.sfx.good();
          if (initSlot >= 2) {
            const name = initials.join('');
            void saveEntry(GAME_ID, name, this.state.finalScore, this.state.playerUID ?? undefined).then(async () => {
              void tryWriteScore(this.state.finalScore);
              const board = await loadBoard(GAME_ID);
              this.setState({ resultPhase: 'board', savedName: name, board });
            });
          } else { this.setState({ initSlot: initSlot + 1 }); }
        }
      } else { this.sfx.good(); this.startReaction(); }
    }
  };

  legendFor(): LegendButton[] {
    const A = (l: string): LegendButton => ({ c: RED, cDark: RED_D, g: '⬤', l, size: 76, tap: () => this.press('A') });
    const B = (g: string, l: string): LegendButton => ({ c: BLUE, cDark: BLUE_D, g, l, size: 60, tap: () => this.press('B') });
    const C = (g: string, l: string): LegendButton => ({ c: YELLOW, cDark: YELLOW_D, g, l, size: 60, tap: () => this.press('C') });
    const { screen, resultPhase } = this.state;
    if (screen === 'reaction') return [A('Tap when it says GO!')];
    if (screen === 'result') {
      if (resultPhase === 'entry') return [B('◀', 'Letter'), A('Lock it in'), C('▶', 'Letter')];
      return [A('Play again!')];
    }
    return [A('Press to play!')];
  }

  reactionBg(phase: RPhase) {
    return phase === 'go' ? '#43a277' : phase === 'hit' ? '#0aa4eb' : phase === 'early' ? '#a30078' : '#ff4747';
  }

  render() {
    const s = this.state;
    const rBg = this.reactionBg(s.rPhase);
    const ph = s.rPhase;
    const rBigText = ph === 'intro' ? 'Get ready…' : ph === 'wait' ? 'WAIT FOR IT…' : ph === 'go' ? 'GO! TAP NOW!' : ph === 'early' ? 'TOO SOON! 🙈' : s.rMs + ' ms!';
    const rSubText = ph === 'intro' ? 'Tap the big red button ONLY when the screen turns green!'
      : ph === 'wait' ? "Hands ready… don't tap yet!"
      : ph === 'go' ? ''
      : ph === 'early' ? 'The rocket needs you to wait for GO!'
      : (s.rMs < 350 ? 'Lightning fast! ⚡' : s.rMs < 600 ? 'Super speedy!' : 'Great launch!');
    const rDots = [0,1,2,3,4].map(i => ({ bg: i < s.rResults.length ? (s.rResults[i] > 0 ? '#ffc832' : 'rgba(0,0,0,0.35)') : 'rgba(255,255,255,0.25)' }));
    const shellBg = s.screen === 'reaction' ? rBg : 'var(--seasalt)';

    return (
      <div style={{ position: 'fixed', inset: 0, background: shellBg, transition: 'background 400ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: 'var(--font-body)', userSelect: 'none' }}>
        <div ref={this.gameRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ width: STAGE_W, height: STAGE_H, position: 'relative', overflow: 'hidden', transform: `scale(${s.scale})`, transformOrigin: 'center', flex: 'none' }}>
            {s.screen === 'attract' && <ScreenAttract onPress={() => this.press('A')} gameTitle={GAME_TITLE} gameTag={GAME_TAG} mascotSrc={MASCOT_SRC} themeColor={THEME_COLOR} />}
            {s.screen === 'reaction' && (
              <ScreenReaction onPress={() => { this._lastInput = Date.now(); this.reactPress(); }} rBg={rBg} scoreText={s.score.toLocaleString() + ' pts'} rDots={rDots} rocketY={ph === 'hit' ? -60 : 0} rBigText={rBigText} rSubText={rSubText} rTextAnim={ph === 'go' ? 'wkBlink 0.5s ease infinite' : 'none'} />
            )}
            {s.screen === 'result' && (
              <ScreenResult confettiPieces={s.confettiPieces} resultTitle={s.finalScore > 0 ? 'GREAT JOB!' : 'GOOD TRY!'} gameTitle={GAME_TITLE} finalScore={s.finalScore} resultPhase={s.resultPhase} initials={s.initials} initSlot={s.initSlot} board={s.board} savedName={s.savedName} />
            )}
            {s.screen !== 'attract' && <ButtonLegend legend={this.legendFor()} />}
          </div>
        </div>
      </div>
    );
  }
}
