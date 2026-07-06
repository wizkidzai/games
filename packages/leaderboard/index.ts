/**
 * @wizkidz/leaderboard
 *
 * Booth game leaderboard, stored entirely in localStorage on the kiosk device.
 * No server calls — all data lives on-device, per CLAUDE.md rule 3.
 *
 * RFID player UID is tagged on every score entry; it is optional so
 * anonymous plays are still recorded.
 */

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

// ------------------------------------------------------------------ public API

/** Load top-5 entries for a booth game, highest score first. */
export async function loadBoard(gameId: string): Promise<BoardEntry[]> {
  return localBoard(gameId);
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
  saveLocalEntry(gameId, entry);
}

// ------------------------------------------------------------------ local storage

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
