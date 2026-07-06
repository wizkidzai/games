/**
 * Code Cracker — grid-based robot programming game.
 * Extracted from wizkidzboothgames/app/src/App.jsx (robot logic only).
 * Clock is always 90s (as in original).
 */

import { Component, createRef } from 'react';
import { CONFIG } from './config';
import { Sfx } from './audio';
import { loadBoard, qualifies, saveEntry } from '@wizkidz/firebase-lb';
import type { BoardEntry } from '@wizkidz/firebase-lb';
import { tryReadPlayerUID, tryWriteScore } from './rfid';
import ScreenAttract from './components/ScreenAttract';
import ScreenRobot from './components/ScreenRobot';
import type { ProgramSlot, GridCell } from './components/ScreenRobot';
import ScreenResult from './components/ScreenResult';
import type { ConfettiPiece } from './components/ScreenResult';
import ButtonLegend from './components/ButtonLegend';
import type { LegendButton } from './components/ButtonLegend';
import {
  BLUE, BLUE_D, RED, RED_D, YELLOW, YELLOW_D,
  GAME_ID, GAME_TITLE, GAME_TAG, THEME_COLOR, MASCOT_SRC, LEVELS,
} from './data';

const STAGE_W = 1280, STAGE_H = 1080;
type RobotCmd = 'L' | 'F' | 'R';

interface Battery { x: number; y: number; }

interface AppState {
  scale: number;
  screen: 'attract' | 'robot' | 'result';
  score: number;
  timeLeft: number;
  timeTotal: number;
  // robot state
  rbLevel: number; rbX: number; rbY: number; rbRot: number;
  rbBatteries: Battery[];
  rbBump: boolean; rbFlash: string;
  rbProg: RobotCmd[]; rbRun: boolean; rbStep: number;
  // result state
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
    scale: 1, screen: 'attract', score: 0, timeLeft: 0, timeTotal: 90,
    rbLevel: 0, rbX: 0, rbY: 4, rbRot: 0, rbBatteries: [], rbBump: false, rbFlash: '',
    rbProg: [], rbRun: false, rbStep: -1,
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
    if (this.state.screen === 'robot') {
      if (k === 'ArrowUp') { e.preventDefault(); this.addCmd('F'); return; }
      if (k === 'Backspace') { e.preventDefault(); this.undoCmd(); return; }
    }
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

  loadLevel(n: number) {
    const lv = LEVELS[n];
    this.setState({
      rbLevel: n, rbX: lv.start[0], rbY: lv.start[1], rbRot: 0,
      rbBatteries: lv.batteries.map(b => ({ x: b[0], y: b[1] })),
      rbBump: false, rbProg: [], rbRun: false, rbStep: -1,
    });
  }

  startRobot() {
    this.clearTimers();
    this.loadLevel(0);
    this.setState({ screen: 'robot', score: 0, rbFlash: 'LEVEL 1!' });
    this.after(1100, () => this.setState({ rbFlash: '' }));
    this.startClock(90, () => { void this.endGame(this.state.score); });
  }

  rbDir() { return ((Math.round(this.state.rbRot / 90) % 4) + 4) % 4; }

  addCmd(c: RobotCmd) {
    const s = this.state;
    if (s.rbRun || s.rbFlash) return;
    if (s.rbProg.length >= 14) { this.sfx.bad(); return; }
    this.sfx.blip();
    this.setState({ rbProg: s.rbProg.concat([c]) });
  }

  undoCmd() {
    const s = this.state;
    if (s.rbRun || s.rbFlash || !s.rbProg.length) return;
    this.sfx.tone(300, 0.06, 'square', 0.1);
    this.setState({ rbProg: s.rbProg.slice(0, -1) });
  }

  runProgram() {
    const s = this.state;
    if (s.rbRun || s.rbFlash || !s.rbProg.length) return;
    this.sfx.go();
    this.setState({ rbRun: true, rbStep: -1 });
    this.after(400, () => this.execStep(0));
  }

  rbFail(msg: string) {
    this.sfx.bad();
    const s = this.state;
    const lv = LEVELS[s.rbLevel];
    this.setState({ rbBump: true, rbFlash: msg });
    this.after(350, () => this.setState({ rbBump: false }));
    this.after(1600, () => {
      this.setState({ rbFlash: '', rbRun: false, rbStep: -1, rbX: lv.start[0], rbY: lv.start[1], rbRot: 0 });
    });
  }

  execStep(i: number) {
    const s = this.state;
    if (this.state.screen !== 'robot') return;
    if (i >= s.rbProg.length) { this.rbFail('Out of code! Add more steps!'); return; }
    this.setState({ rbStep: i });
    const cmd = s.rbProg[i];
    if (cmd === 'L' || cmd === 'R') {
      this.sfx.tone(430, 0.06, 'square', 0.1);
      this.setState({ rbRot: s.rbRot + (cmd === 'L' ? -90 : 90) });
      this.after(430, () => this.execStep(i + 1));
      return;
    }
    const dir = this.rbDir();
    const dx = [0, 1, 0, -1][dir], dy = [-1, 0, 1, 0][dir];
    const nx = s.rbX + dx, ny = s.rbY + dy;
    const lv = LEVELS[s.rbLevel];
    const blocked = nx < 0 || nx > 4 || ny < 0 || ny > 4 || lv.walls.some(w => w[0] === nx && w[1] === ny);
    if (blocked) { this.rbFail('Bonk! 🤕 Debug your code!'); return; }
    this.sfx.tone(300, 0.06, 'square', 0.1);
    let score = s.score;
    let batteries = s.rbBatteries;
    const hitB = batteries.find(b => b.x === nx && b.y === ny);
    if (hitB) { score += 50; batteries = batteries.filter(b => b !== hitB); this.sfx.collect(); }
    this.setState({ rbX: nx, rbY: ny, score, rbBatteries: batteries });
    if (lv.star[0] === nx && lv.star[1] === ny) {
      score += 300; this.setState({ score });
      if (s.rbLevel >= LEVELS.length - 1) {
        this.sfx.fanfare();
        this.setState({ rbFlash: 'RESCUED! 🎉' });
        this.after(1200, () => { void this.endGame(this.state.score); });
      } else {
        this.sfx.fanfare();
        const nl = s.rbLevel + 1;
        this.setState({ rbFlash: 'LEVEL ' + (nl + 1) + '!' });
        this.after(1100, () => { this.loadLevel(nl); this.setState({ rbFlash: '' }); });
      }
      return;
    }
    this.after(430, () => this.execStep(i + 1));
  }

  press = (btn: 'A' | 'B' | 'C') => {
    this._lastInput = Date.now();
    const { screen, resultPhase, initials, initSlot } = this.state;
    if (screen === 'attract') { this.sfx.good(); this.startRobot(); return; }
    if (screen === 'robot') {
      if (btn === 'B') this.addCmd('L');
      else if (btn === 'C') this.addCmd('R');
      else this.runProgram();
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
      } else { this.sfx.good(); this.startRobot(); }
    }
  };

  legendFor(): LegendButton[] {
    const B = (g: string, l: string): LegendButton => ({ c: BLUE, cDark: BLUE_D, g, l, size: 60, tap: () => this.press('B') });
    const A = (l: string): LegendButton => ({ c: RED, cDark: RED_D, g: '⬤', l, size: 76, tap: () => this.press('A') });
    const C = (g: string, l: string): LegendButton => ({ c: YELLOW, cDark: YELLOW_D, g, l, size: 60, tap: () => this.press('C') });
    const { screen, resultPhase } = this.state;
    if (screen === 'robot') return [B('↺', 'Add turn'), A('Run the code!'), C('↻', 'Add turn')];
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
    const lv = LEVELS[s.rbLevel];

    const cells: GridCell[] = [];
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      const wall = lv.walls.some(w => w[0] === x && w[1] === y);
      const star = lv.star[0] === x && lv.star[1] === y;
      const bat = s.rbBatteries.some(b => b.x === x && b.y === y);
      cells.push({ bg: wall ? '#004545' : star ? '#fff1cc' : '#ffffff', bc: wall ? '#004545' : '#e3f1f1', icon: star ? '⭐' : bat ? '🔋' : '' });
    }

    const cmdColors = {
      L: { bg: '#cdeefc', bc: '#0aa4eb', fg: '#076e9d' },
      F: { bg: '#d6ede2', bc: '#43a277', fg: '#307354' },
      R: { bg: '#fff1cc', bc: '#e8ad12', fg: '#85681a' },
    };
    const rbProgSlots: ProgramSlot[] = Array.from({ length: 14 }, (_, i) => {
      const cmd = s.rbProg[i] as RobotCmd | undefined;
      if (!cmd) return { icon: '', bg: '#f4f5f5', bc: '#e8eaea', bs: 'dashed', fg: '#8b9191', scl: 1 };
      const c = cmdColors[cmd];
      const active = s.rbRun && s.rbStep === i;
      return { icon: { L: '↺', F: '▲', R: '↻' }[cmd], bg: active ? c.bc : c.bg, bc: c.bc, bs: 'solid', fg: active ? '#ffffff' : c.fg, scl: active ? 1.12 : 1 };
    });

    const goReady = !s.rbRun && !s.rbFlash && s.rbProg.length > 0;

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--seasalt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: 'var(--font-body)', userSelect: 'none' }}>
        <div ref={this.gameRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ width: STAGE_W, height: STAGE_H, position: 'relative', overflow: 'hidden', transform: `scale(${s.scale})`, transformOrigin: 'center', flex: 'none' }}>
            {s.screen === 'attract' && <ScreenAttract onPress={() => this.press('A')} gameTitle={GAME_TITLE} gameTag={GAME_TAG} mascotSrc={MASCOT_SRC} themeColor={THEME_COLOR} />}
            {s.screen === 'robot' && (
              <ScreenRobot
                scoreText={s.score.toLocaleString() + ' pts'}
                timerPct={timerPct} timeText={Math.ceil(s.timeLeft) + 's'} timeColor={timeColor}
                rbLevelText={'Level ' + (s.rbLevel + 1) + ' of ' + LEVELS.length}
                rbProgSlots={rbProgSlots}
                onUndo={() => { this._lastInput = Date.now(); this.undoCmd(); }}
                onAddL={() => { this._lastInput = Date.now(); this.addCmd('L'); }}
                onAddF={() => { this._lastInput = Date.now(); this.addCmd('F'); }}
                onAddR={() => { this._lastInput = Date.now(); this.addCmd('R'); }}
                onGo={() => { this._lastInput = Date.now(); this.runProgram(); }}
                rbGoBg={s.rbRun ? '#8b9191' : goReady ? '#ff4747' : '#c9cdcd'}
                rbGoShadow={s.rbRun ? '#6f7575' : goReady ? '#e62e2e' : '#a9adad'}
                rbGoText={s.rbRun ? 'Running…' : '▶ GO!'}
                rbCells={cells}
                rbTransform={`translate(${s.rbX * 108}px, ${s.rbY * 108}px) rotate(${s.rbRot}deg)`}
                rbShakeAnim={s.rbBump ? 'wkShake 320ms ease' : 'none'}
                rbFlashShow={!!s.rbFlash} rbFlashText={s.rbFlash}
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
