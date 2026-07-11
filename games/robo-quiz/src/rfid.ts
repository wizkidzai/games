/**
 * Simplified RFID integration — scope: read player ID → tag leaderboard score.
 * Nothing else. No session management, no game flow orchestration.
 *
 * Uses @wizkidz/card-io for the protocol layer.
 * The concrete transport is Web NFC (NDEFReader); falls back silently when
 * the API is unavailable (most desktop browsers).
 */

import { readCard, writeScoreWithRetry } from '@wizkidz/card-io';
import type { NFCReaderInterface, RawCard } from '@wizkidz/card-io';

// ------------------------------------------------------------------ Web NFC adapter

class WebNFCReader implements NFCReaderInterface {
  private _pending: RawCard | null = null;
  private _scanning = false;

  isAvailable(): boolean {
    return 'NDEFReader' in window;
  }

  async detectCard(): Promise<RawCard | null> {
    if (!this.isAvailable()) return null;
    if (!this._scanning) await this._startScan();
    return this._pending;
  }

  async write(_card: RawCard, byteOffset: number, data: Uint8Array | number): Promise<void> {
    if (!this._pending) throw new Error('No card present');
    const bytes = new Uint8Array(this._pending.bytes);
    if (typeof data === 'number') {
      bytes[byteOffset] = data;
    } else {
      data.forEach((b, i) => { bytes[byteOffset + i] = b; });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writer = new (window as any).NDEFReader() as any;
    await writer.write({ records: [{ recordType: 'unknown', data: bytes.buffer }] });
    this._pending = { uid: this._pending.uid, bytes };
  }

  async read(_card: RawCard, byteOffset: number, length: number): Promise<Uint8Array> {
    if (!this._pending) throw new Error('No card present');
    return this._pending.bytes.slice(byteOffset, byteOffset + length);
  }

  private async _startScan(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reader = new (window as any).NDEFReader() as any;
    await reader.scan();
    this._scanning = true;
    reader.addEventListener('reading', (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const record = e.message?.records?.[0];
      if (record?.data) {
        this._pending = {
          uid: e.serialNumber as string,
          bytes: new Uint8Array(record.data.buffer as ArrayBuffer),
        };
      }
    });
  }
}

// ------------------------------------------------------------------ singleton

const _reader = new WebNFCReader();

/**
 * Try to read a player ID from the RFID card.
 * Returns the card UID string, or null if no card / API unavailable.
 */
export async function tryReadPlayerUID(): Promise<string | null> {
  if (!_reader.isAvailable()) return null;
  try {
    const card = await readCard(_reader);
    return card?.uid ?? null;
  } catch {
    return null;
  }
}

/**
 * Try to write an updated total score back to the card.
 * Silently no-ops when RFID is unavailable.
 */
export async function tryWriteScore(newTotalPoints: number): Promise<void> {
  if (!_reader.isAvailable()) return;
  try {
    await writeScoreWithRetry(_reader, newTotalPoints);
  } catch {
    /* silently ignore */
  }
}
