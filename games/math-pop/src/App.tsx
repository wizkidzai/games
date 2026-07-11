/**
 * Math Pop — math true/false game.
 * Extracted from wizkidzboothgames/app/src/App.jsx (math logic only).
 */

import { Component } from 'react';
import { CONFIG } from './config';
import { Sfx } from './audio';
import { loadBoard, qualifies, saveEntry } from '@wizkidz/leaderboard';
import type { BoardEntry } from '@wizkidz/leaderboard';
import { tryReadPlayerUID, tryWriteScore } from './rfid';
import ScreenAttract from './components/ScreenAttract';
import ScreenMath from './components/ScreenMath';
import ScreenResult from './components/ScreenResult';
import type { ConfettiPiece } from './components/ScreenResult';
import ButtonLegend from './components/ButtonLegend';
import type { LegendButton } from './components/ButtonLegend';
import {
  BLUE, BLUE_D, RED, RED_D, YELLOW, YELLOW_D,
  GAME_ID, GAME_TITLE, GAME_TAG, THEME_COLOR, MASCOT_SRC,
} from './data';

interface AppState {
  screen: 'attract' | 'math' | 'result';
  score: number;
  timeLeft: number;
  timeTotal: number;
  mA: number; mB: number; mShown: number; mTruth: boolean;
  mStreak: number; mFb: 'right' | 'wrong' | null; mOp: '+' | '−';
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
    screen: 'attract', score: 0, timeLeft: 0, timeTotal: 45,
    mA: 0, mB: 0, mShown: 0, mTruth: true, mStreak: 0, mFb: null, mOp: '+',
    finalScore: 0, resultPhase: 'board',
    initials: ['A', 'A', 'A'], initSlot: 0, savedName: '',
    board: [], confettiPieces: [],
    playerUID: null,
  };

  private sfx = new Sfx(() => CONFIG.soundOn);
  private _timeouts: ReturnType<typeof setTimeout>[] = [];
  private _tickIv?: ReturnType<typeof setInterval>;
  private _idleIv?: ReturnType<typeof setInterval>;
  private _lastInput = Date.now();
  private _clockEnd = 0;

  componentDidMount() {
    window.addEventListener('keydown', this.onKey);
    this._idleIv = setInterval(() => {
      if (Date.now() - this._lastInput > CONFIG.idleSeconds * 1000) this.goKiosk();
    }, 1000);
    void tryReadPlayerUID().then(uid => { if (uid) this.setState({ playerUID: uid }); });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKey);
    clearInterval(this._idleIv);
    this.clearTimers();
  }

  onKey = (e: KeyboardEvent) => {
    this._lastInput = Date.now();
    const k = e.key;
    if (k === ' ' || k === 'Enter' || k === 'b' || k === CONFIG.keyRed) { e.preventDefault(); this.press('A'); }
    else if (k === 'ArrowLeft'  || k === 'a' || k === CONFIG.keyBlue)   { e.preventDefault(); this.press('B'); }
    else if (k === 'ArrowRight' || k === 'c' || k === CONFIG.keyYellow) { e.preventDefault(); this.press('C'); }
  };

  after(ms: number, fn: () => void) { const t = setTimeout(fn, ms); this._timeouts.push(t); return t; }
  clearTimers() { this._timeouts.forEach(clearTimeout); this._timeouts = []; clearInterval(this._tickIv); }

  startClock(seconds: number, onEnd: () => void) {
    this._clockEnd = Date.now() + seconds * 1000;
    this.setState({ timeLeft: seconds, timeTotal: seconds });
    clearInterval(this._tickIv);
    this._tickIv = setInterval(() => {
      const left = Math.max(0, (this._clockEnd - Date.now()) / 1000);
      this.setState({ timeLeft: left });
      if (left <= 0) { clearInterval(this._tickIv); onEnd(); }
    }, 100);
  }

  async endGame(score: number) {
    this.clearTimers();
    this.sfx.fanfare();
    const board = await loadBoard(GAME_ID);
    const resultPhase = qualifies(board, score) ? 'entry' : 'board';
    this.setState({
      screen: 'result', finalScore: score,
      resultPhase,
      initials: ['A', 'A', 'A'], initSlot: 0, savedName: '', board,
      confettiPieces: this.buildConfetti(score > 0),
    });
    if (resultPhase === 'board') this.after(10000, this.goKiosk);
  }

  // Game over is final once the board phase shows — return to the kiosk
  // landing page either on the next button press or after 10s idle.
  goKiosk = () => { window.location.href = '/'; };

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

  startMath() {
    this.clearTimers();
    this.setState({ screen: 'math', score: 0, mStreak: 0, mFb: null });
    this.mathNext();
    this.startClock(CONFIG.roundSeconds, () => { void this.endGame(this.state.score); });
  }

  mathNext() {
    const add = Math.random() > 0.4;
    let a = 2 + Math.floor(Math.random() * 9);
    let b = 1 + Math.floor(Math.random() * 9);
    if (!add && b > a) { const t = a; a = b; b = t; }
    const correct = add ? a + b : a - b;
    const truth = Math.random() < 0.55;
    let shown = correct;
    if (!truth) {
      const off = (1 + Math.floor(Math.random() * 2)) * (Math.random() > 0.5 ? 1 : -1);
      shown = Math.max(0, correct + off);
      if (shown === correct) shown = correct + 2;
    }
    this.setState({ mA: a, mB: b, mOp: add ? '+' : '−', mShown: shown, mTruth: truth, mFb: null });
  }

  answerMath(sayTrue: boolean) {
    const s = this.state;
    if (s.mFb) return;
    if (sayTrue === s.mTruth) {
      const streak = s.mStreak + 1;
      const pts = 100 + (streak >= 3 ? 25 * (streak - 2) : 0);
      this.sfx.good();
      this.setState({ score: s.score + pts, mStreak: streak, mFb: 'right' });
    } else {
      this.sfx.bad();
      this.setState({ mStreak: 0, mFb: 'wrong' });
    }
    this.after(550, () => this.mathNext());
  }

  press = (btn: 'A' | 'B' | 'C') => {
    this._lastInput = Date.now();
    const { screen, resultPhase, initials, initSlot } = this.state;
    if (screen === 'attract') { this.sfx.good(); this.startMath(); return; }
    if (screen === 'math') {
      if (btn === 'B') this.answerMath(false);
      else if (btn === 'C') this.answerMath(true);
      return;
    }
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
              this.after(10000, this.goKiosk);
            });
          } else { this.setState({ initSlot: initSlot + 1 }); }
        }
      } else { this.sfx.good(); this.goKiosk(); }
    }
  };

  legendFor(): LegendButton[] {
    const B = (g: string, l: string): LegendButton => ({ c: BLUE, cDark: BLUE_D, g, l, size: 60, tap: () => this.press('B') });
    const A = (l: string): LegendButton => ({ c: RED, cDark: RED_D, g: '⬤', l, size: 76, tap: () => this.press('A') });
    const C = (g: string, l: string): LegendButton => ({ c: YELLOW, cDark: YELLOW_D, g, l, size: 60, tap: () => this.press('C') });
    const { screen, resultPhase } = this.state;
    if (screen === 'math')   return [B('◀', 'Nope!'), C('▶', 'Yes!')];
    if (screen === 'result') {
      if (resultPhase === 'entry') return [B('◀', 'Letter'), A('Lock it in'), C('▶', 'Letter')];
      return [A('Back to games!')];
    }
    return [A('Press to play!')];
  }

  render() {
    const s = this.state;
    const RED_C = '#ff4747';
    const mBorder = s.mFb === 'right' ? '#43a277' : s.mFb === 'wrong' ? RED_C : 'var(--gray-100)';
    const timerPct = s.timeTotal ? Math.round((s.timeLeft / s.timeTotal) * 100) : 0;
    const timeColor = s.timeLeft <= 10 ? RED_C : 'var(--jet)';

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--seasalt)', overflow: 'hidden', fontFamily: 'var(--font-body)', userSelect: 'none' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {s.screen === 'attract' && <ScreenAttract onPress={() => this.press('A')} gameTitle={GAME_TITLE} gameTag={GAME_TAG} mascotSrc={MASCOT_SRC} themeColor={THEME_COLOR} countdownSeconds={CONFIG.attractCountdownSeconds} />}
            {s.screen === 'math' && (
              <ScreenMath
                scoreText={s.score.toLocaleString() + ' pts'}
                timerPct={timerPct} timeText={Math.ceil(s.timeLeft) + 's'} timeColor={timeColor}
                mStreakShow={s.mStreak >= 2} mStreakText={'🔥 ' + s.mStreak + ' in a row!'}
                mBorder={mBorder} mExpr={s.mA + ' ' + s.mOp + ' ' + s.mB + ' = ' + s.mShown}
                onNo={() => { this._lastInput = Date.now(); this.answerMath(false); }}
                onYes={() => { this._lastInput = Date.now(); this.answerMath(true); }}
              />
            )}
            {s.screen === 'result' && (
              <ScreenResult confettiPieces={s.confettiPieces} resultTitle={s.finalScore > 0 ? 'GREAT JOB!' : 'GOOD TRY!'} gameTitle={GAME_TITLE} finalScore={s.finalScore} resultPhase={s.resultPhase} initials={s.initials} initSlot={s.initSlot} board={s.board} savedName={s.savedName} />
            )}
            {s.screen !== 'attract' && <ButtonLegend legend={this.legendFor()} />}
        </div>
      </div>
    );
  }
}
