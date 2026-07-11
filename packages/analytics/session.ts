const DEFAULT_INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes

export interface SessionConfig {
  onTimeout: () => void;
  timeoutMs?: number;
}

export class SessionManager {
  private lastActivity: number = Date.now();
  private timer: ReturnType<typeof setInterval> | null = null;
  private onTimeout: () => void;
  private timeoutMs: number;

  constructor(config: SessionConfig) {
    this.onTimeout = config.onTimeout;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_INACTIVITY_MS;
  }

  start(): void {
    this.recordActivity();
    this.timer = setInterval(() => this.checkInactivity(), 60_000);
    document.addEventListener('pointerdown', this.recordActivity);
    document.addEventListener('keydown', this.recordActivity);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    document.removeEventListener('pointerdown', this.recordActivity);
    document.removeEventListener('keydown', this.recordActivity);
  }

  private recordActivity = (): void => {
    this.lastActivity = Date.now();
  };

  private checkInactivity(): void {
    if (Date.now() - this.lastActivity > this.timeoutMs) {
      this.onTimeout();
    }
  }

  getLastActivity(): number {
    return this.lastActivity;
  }
}
