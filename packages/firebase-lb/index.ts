/**
 * @wizkidz/firebase-lb
 *
 * Leaderboard backed by Firebase Realtime Database (free Spark plan).
 * Scoped to booth games only — does NOT touch Spark Quest or other collections.
 *
 * Config is read from Vite env vars (VITE_FIREBASE_*) so API keys are never
 * hard-coded. Falls back to localStorage when Firebase is unavailable.
 *
 * RFID player UID is tagged on every score entry; it is optional so
 * anonymous plays are still recorded.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  query,
  orderByChild,
  limitToLast,
  get,
} from 'firebase/database';

// ------------------------------------------------------------------ types

export interface BoardEntry {
  /** Player initials (3 chars) entered at result screen */
  n: string;
  /** Score for this play */
  s: number;
  /** RFID card UID — present when player tapped their card */
  uid?: string;
  /** Unix ms timestamp */
  ts: number;
}

// ------------------------------------------------------------------ firebase init

function getApp_(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp({
    apiKey:        import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL:   import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId:     import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId:         import.meta.env.VITE_FIREBASE_APP_ID,
  });
}

// ------------------------------------------------------------------ public API

/** Load top-5 entries for a booth game, highest score first. */
export async function loadBoard(gameId: string): Promise<BoardEntry[]> {
  try {
    const db = getDatabase(getApp_());
    const q = query(
      ref(db, `booth-scores/${gameId}`),
      orderByChild('s'),
      limitToLast(5),
    );
    const snap = await get(q);
    if (!snap.exists()) return localBoard(gameId);
    const entries: BoardEntry[] = [];
    snap.forEach(child => entries.push(child.val() as BoardEntry));
    return entries.sort((a, b) => b.s - a.s);
  } catch {
    return localBoard(gameId);
  }
}

/** True when the score would make the top-5 leaderboard. */
export function qualifies(board: BoardEntry[], score: number): boolean {
  if (score <= 0) return false;
  return board.length < 5 || score > board[board.length - 1].s;
}

/**
 * Save a leaderboard entry.
 * @param gameId   e.g. 'echo-bots'
 * @param name     3-char initials
 * @param score    points earned this play
 * @param playerUID  RFID card UID (optional — stripped-down RFID integration:
 *                   read player ID → tag score → nothing else)
 */
export async function saveEntry(
  gameId: string,
  name: string,
  score: number,
  playerUID?: string,
): Promise<void> {
  const entry: BoardEntry = {
    n: name.toUpperCase().slice(0, 3),
    s: score,
    ts: Date.now(),
    ...(playerUID ? { uid: playerUID } : {}),
  };
  try {
    const db = getDatabase(getApp_());
    await push(ref(db, `booth-scores/${gameId}`), entry);
  } catch {
    // Firebase unavailable — persist locally so the result screen still works
    saveLocalEntry(gameId, entry);
  }
}

// ------------------------------------------------------------------ local fallback

const LOCAL_KEY = 'wizkidz-booth-lb-v2';

function localBoard(gameId: string): BoardEntry[] {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}') as Record<string, BoardEntry[]>;
    return (all[gameId] ?? []).slice(0, 5);
  } catch {
    return [];
  }
}

function saveLocalEntry(gameId: string, entry: BoardEntry): void {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}') as Record<string, BoardEntry[]>;
    const board = (all[gameId] ?? []).concat(entry);
    board.sort((a, b) => b.s - a.s);
    all[gameId] = board.slice(0, 5);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* storage full or unavailable */
  }
}
