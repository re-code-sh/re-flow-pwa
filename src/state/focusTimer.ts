import { ActiveFocus, FocusSession, InterruptTag } from '../core/types';
import { repo } from '../db/repo';
import { todayKey, fmtClock } from '../core/jalali';

const STORAGE_KEY = 'active_focus_v1';

export interface FocusViewState {
  focus: ActiveFocus | null;
  remainingSec: number;
  finished: boolean;
  progress: number;
  clock: string;
}

type Listener = (state: FocusViewState) => void;

class FocusTimerEngine {
  private activeFocus: ActiveFocus | null = null;
  private timer: number | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.restore();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): FocusViewState {
    if (!this.activeFocus) {
      return {
        focus: null,
        remainingSec: 0,
        finished: false,
        progress: 0,
        clock: '00:00',
      };
    }

    const remainingSec = this.calculateRemaining(this.activeFocus);
    const finished = remainingSec <= 0 && !this.activeFocus.paused;
    const progress =
      this.activeFocus.totalSec === 0
        ? 0
        : Math.min(Math.max(1 - remainingSec / this.activeFocus.totalSec, 0), 1);

    return {
      focus: this.activeFocus,
      remainingSec,
      finished,
      progress,
      clock: fmtClock(remainingSec, 'fa'),
    };
  }

  private calculateRemaining(focus: ActiveFocus): number {
    if (focus.paused) return focus.pausedLeftSec;
    const left = (focus.endAtMs - Date.now()) / 1000;
    return Math.max(Math.ceil(left), 0);
  }

  public async restore(): Promise<boolean> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const focus: ActiveFocus = JSON.parse(raw);
      this.activeFocus = focus;

      const state = this.getState();
      if (state.finished) {
        // Closed while away
        await repo.endFocusSession({
          sessionId: focus.sessionId,
          completed: true,
          endedAtMs: focus.endAtMs,
        });
      } else if (!focus.paused) {
        this.startTicker();
      }

      this.notify();
      return true;
    } catch (_) {
      return false;
    }
  }

  public async start({
    taskId,
    title,
    minutes = 25,
    kind = 'task',
  }: {
    taskId: string | null;
    title: string;
    minutes?: number;
    kind?: 'task' | 'fun';
  }): Promise<string> {
    const sessionId = await repo.startFocusSession({
      dayKey: todayKey(),
      taskId,
      title,
      plannedMin: minutes,
      kind,
    });

    const totalSec = minutes * 60;
    const focus: ActiveFocus = {
      sessionId,
      taskId,
      title,
      kind,
      totalSec,
      endAtMs: Date.now() + totalSec * 1000,
      paused: false,
      pausedLeftSec: totalSec,
    };

    this.activeFocus = focus;
    this.persist(focus);
    this.startTicker();
    this.notify();
    return sessionId;
  }

  public pause(): void {
    if (!this.activeFocus || this.activeFocus.paused) return;
    const remaining = this.calculateRemaining(this.activeFocus);
    this.activeFocus = {
      ...this.activeFocus,
      paused: true,
      pausedLeftSec: remaining,
    };
    this.stopTicker();
    this.persist(this.activeFocus);
    this.notify();
  }

  public resume(): void {
    if (!this.activeFocus || !this.activeFocus.paused) return;
    this.activeFocus = {
      ...this.activeFocus,
      paused: false,
      endAtMs: Date.now() + this.activeFocus.pausedLeftSec * 1000,
    };
    this.persist(this.activeFocus);
    this.startTicker();
    this.notify();
  }

  public extend(minutes: number): void {
    if (!this.activeFocus) return;
    const extraSec = minutes * 60;
    this.activeFocus = {
      ...this.activeFocus,
      totalSec: this.activeFocus.totalSec + extraSec,
      paused: false,
      endAtMs: Date.now() + extraSec * 1000,
    };
    this.persist(this.activeFocus);
    this.startTicker();
    this.notify();
  }

  public async end({
    completed,
    interruptNote,
    interruptTag,
  }: {
    completed: boolean;
    interruptNote?: string | null;
    interruptTag?: InterruptTag | null;
  }): Promise<void> {
    this.stopTicker();
    if (this.activeFocus) {
      await repo.endFocusSession({
        sessionId: this.activeFocus.sessionId,
        completed,
        interruptNote,
        interruptTag,
      });
    }
    this.activeFocus = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  private startTicker(): void {
    this.stopTicker();
    this.timer = window.setInterval(() => {
      if (!this.activeFocus) {
        this.stopTicker();
        return;
      }
      this.notify();
      const state = this.getState();
      if (state.finished) {
        this.stopTicker();
      }
    }, 500);
  }

  private stopTicker(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private persist(focus: ActiveFocus): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(focus));
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

export const focusTimer = new FocusTimerEngine();
