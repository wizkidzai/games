/**
 * Color Clash — STEM trivia with colored answer buttons.
 * Extracted from wizkidzboothgames/app/src/App.jsx (quiz logic only).
 */

import { Component, createRef } from 'react';
import { CONFIG } from './config';
import { Sfx } from './audio';
import { loadBoard, qualifies, saveEntry } from '@wizkidz/leaderboard';
import type { BoardEntry } from '@wizkidz/leaderboard';
import { tryReadPlayerUID, tryWriteScore } from './rfid';
import ScreenAttract from './components/ScreenAttract';
import ScreenQuiz from './components/ScreenQuiz';
import type { QuizOption } from './components/ScreenQuiz';
import ScreenResult from './components/ScreenResult';
import type { ConfettiPiece } from './components/ScreenResult';
import ButtonLegend from './components/ButtonLegend';
import type { LegendButton } from './components/ButtonLegend';
import {
  BLUE, BLUE_D, RED, RED_D, YELLOW, YELLOW_D,
  GAME_ID, GAME_TITLE, GAME_TAG, THEME_COLOR, MASCOT_SRC, QUESTIONS,
} from './data';

const STAGE_W = 1280, STAGE_H = 1080;

interface AppState {
  scale: number;
  screen: 'attract' | 'quiz' | 'result';
  score: number;
  timeLeft: number;
  timeTotal: number;
  qOrder: number[];
  qIndex: number;
  qFb: 'right' | 'wrong' | null;
  qLocked: boolean;
  qPicked: number;
  finalScore: number;
  resultPhase: 'entry' | 'board';
  initials: string[];
  initSlot: number;
  savedName: string;
  board: BoardEntry[];
  confettiPieces: ConfettiPiece[];
  playerUID: string | null;
}

const COL_META = [
  { c: BLUE,   cDark: BLUE_D,   glyph: '◀', textC: '#076e9d' },
  { c: RED,    cDark: RED_D,    glyph: '⬤', textC: '#b53232' },
  { c: YELLOW, cDark: YELLOW_D, glyph: '▶', textC: '#85681a' },
];

export default class App extends Component<Record<string, never>, AppState> {
  state: AppState = {
    scale: 1, screen: 'attract', score: 0, timeLeft: 0, timeTotal: 45,
    qOrder: [], qIndex: 0, qFb: null, qLocked: false, qPicked: -1,
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
  private _clockEnd = 0;

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
  clearTimers() { this._timeouts.forEach(clearTimeout); this._timeouts = []; clearInterval(this._tickIv); }
  goAttract = () => { this.clearTimers(); this.setState({ screen: 'attract' }); };

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

  startQuiz() {
    this.clearTimers();
    const order = QUESTIONS.map((_, i) => i).sort(() => Math.random() - 0.5);
    this.setState({ screen: 'quiz', score: 0, qOrder: order, qIndex: 0, qFb: null, qLocked: false, qPicked: -1 });
    this.startClock(CONFIG.roundSeconds, () => { void this.endGame(this.state.score); });
  }

  answerQuiz(idx: number | undefined) {
    const s = this.state;
    if (s.qLocked || idx == null) return;
    const q = QUESTIONS[s.qOrder[s.qIndex]];
    const right = idx === q.a;
    if (right) { this.sfx.good(); this.setState({ score: s.score + 100, qFb: 'right', qLocked: true, qPicked: idx }); }
    else        { this.sfx.bad();  this.setState({ qFb: 'wrong', qLocked: true, qPicked: idx }); }
    this.after(700, () => {
      const nx = (this.state.qIndex + 1) % this.state.qOrder.length;
      this.setState({ qIndex: nx, qFb: null, qLocked: false, qPicked: -1 });
    });
  }

  press = (btn: 'A' | 'B' | 'C') => {
    this._lastInput = Date.now();
    const { screen, resultPhase, initials, initSlot } = this.state;
    if (screen === 'attract') { this.sfx.good(); this.startQuiz(); return; }
    if (screen === 'quiz') {
      const map: Record<'A'|'B'|'C', number> = { B: 0, A: 1, C: 2 };
      this.answerQuiz(map[btn]);
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
            });
          } else { this.setState({ initSlot: initSlot + 1 }); }
        }
      } else { this.sfx.good(); this.startQuiz(); }
    }
  };

  legendFor(): LegendButton[] {
    const B = (g: string, l: string): LegendButton => ({ c: BLUE, cDark: BLUE_D, g, l, size: 60, tap: () => this.press('B') });
    const A = (l: string): LegendButton => ({ c: RED, cDark: RED_D, g: '⬤', l, size: 76, tap: () => this.press('A') });
    const C = (g: string, l: string): LegendButton => ({ c: YELLOW, cDark: YELLOW_D, g, l, size: 60, tap: () => this.press('C') });
    const { screen, resultPhase } = this.state;
    if (screen === 'quiz')   return [B('◀', ''), A('Press the matching color!'), C('▶', '')];
    if (screen === 'result') {
      if (resultPhase === 'entry') return [B('◀', 'Letter'), A('Lock it in'), C('▶', 'Letter')];
      return [A('Play again!')];
    }
    return [A('Press to play!')];
  }

  render() {
    const s = this.state;
    const RED_C = '#ff4747';
    const timerPct = s.timeTotal ? Math.round((s.timeLeft / s.timeTotal) * 100) : 0;
    const timeColor = s.timeLeft <= 10 ? RED_C : 'var(--jet)';

    const quizOpts: QuizOption[] = s.qOrder.length > 0
      ? QUESTIONS[s.qOrder[s.qIndex]].o.map((t, i) => {
          const cm = COL_META[i];
          let bg = '#ffffff', scale = 1;
          if (s.qFb) {
            if (i === QUESTIONS[s.qOrder[s.qIndex]].a) { bg = '#d6ede2'; scale = i === s.qPicked ? 1.05 : 1; }
            else if (i === s.qPicked) { bg = '#ffd9d9'; }
          }
          return { t, bg, scale, c: cm.c, cDark: cm.cDark, glyph: cm.glyph, textC: cm.textC, pick: () => { this._lastInput = Date.now(); this.answerQuiz(i); } };
        })
      : [];

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--seasalt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: 'var(--font-body)', userSelect: 'none' }}>
        <div ref={this.gameRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ width: STAGE_W, height: STAGE_H, position: 'relative', overflow: 'hidden', transform: `scale(${s.scale})`, transformOrigin: 'center', flex: 'none' }}>
            {s.screen === 'attract' && <ScreenAttract onPress={() => this.press('A')} gameTitle={GAME_TITLE} gameTag={GAME_TAG} mascotSrc={MASCOT_SRC} themeColor={THEME_COLOR} />}
            {s.screen === 'quiz' && s.qOrder.length > 0 && (
              <ScreenQuiz
                scoreText={s.score.toLocaleString() + ' pts'}
                timerPct={timerPct} timeText={Math.ceil(s.timeLeft) + 's'} timeColor={timeColor}
                quizProgress={'Question ' + (s.qIndex + 1)} quizQ={QUESTIONS[s.qOrder[s.qIndex]].q}
                quizOpts={quizOpts}
                quizFbShow={!!s.qFb}
                quizFbText={s.qFb === 'right' ? '+100! Nice one! 🎉' : 'Oops — good try!'}
                quizFbColor={s.qFb === 'right' ? '#348160' : RED_C}
              />
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
