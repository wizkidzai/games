// Preserved from games/games/mascot-runner — made generic so any game package
// can extend or re-use this minimal pub/sub state pattern.

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface LeaderboardEntry {
  score: number;
  difficulty: string;
  timestamp: string;
}

export interface BaseGameState {
  score: number;
  highScore: number;
  isRunActive: boolean;
  isRunOver: boolean;
  leaderboard: LeaderboardEntry[];
}

const INITIAL_BASE_STATE: BaseGameState = {
  score: 0,
  highScore: 0,
  isRunActive: false,
  isRunOver: false,
  leaderboard: [],
};

// Generic factory — individual games can use this to create their own slice.
export function createGameStateStore<S extends BaseGameState>(initial: S) {
  let state: S = { ...initial };
  const listeners = new Set<(s: S) => void>();

  function setState(patch: Partial<S>): void {
    state = { ...state, ...patch };
    listeners.forEach(cb => cb(state));
  }

  return {
    getState: () => state,
    subscribe(cb: (s: S) => void): () => void {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    setState,
    addScore(pts: number): void {
      const score = state.score + pts;
      const highScore = Math.max(score, state.highScore);
      setState({ score, highScore } as Partial<S>);
    },
    endRun(): void {
      const entry: LeaderboardEntry = {
        score: state.score,
        difficulty: 'medium',
        timestamp: new Date().toISOString(),
      };
      const leaderboard = [...state.leaderboard, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setState({ isRunActive: false, isRunOver: true, leaderboard } as Partial<S>);
    },
    reset(): void {
      state = { ...initial };
      listeners.forEach(cb => cb(state));
    },
  };
}

// Simple single-instance default store for games that don't need the factory.
export const defaultStore = createGameStateStore<BaseGameState>(INITIAL_BASE_STATE);
