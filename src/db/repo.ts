import { db, DbDay } from './index';
import {
  BacklogItem,
  DayPlan,
  DayTask,
  EnergyCheck,
  FocusSession,
  FunConfig,
  Habit,
  InterruptTag,
  NightRow,
  StatsData,
  Task,
  Thought,
  ThoughtCategory,
} from '../core/types';
import { todayKey, shiftDayKey } from '../core/jalali';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function maxTasksForActiveDays(activeDays: number): number {
  if (activeDays >= 30) return 5;
  if (activeDays >= 15) return 4;
  return 3;
}

export class Repo {
  // ---------- tasks & backlog ----------

  async backlog(): Promise<BacklogItem[]> {
    const rows = await db.tasks
      .filter((t) => t.status === 'pending' && t.deleted_at === null)
      .reverse()
      .sortBy('created_at');

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      notes: r.notes || '',
      created_at: r.created_at,
      updated_at: r.updated_at,
      deleted_at: r.deleted_at,
    }));
  }

  async addBacklog(title: string, notes: string = ''): Promise<BacklogItem> {
    const now = Date.now();
    const id = generateId();
    const task: Task = {
      id,
      title,
      notes,
      is_boulder: false,
      status: 'pending',
      scheduled_date: null,
      reminder_time: null,
      active_order: 0,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.tasks.add(task);
    return {
      id,
      title,
      notes,
      created_at: now,
      updated_at: now,
    };
  }

  async deleteBacklog(id: string): Promise<void> {
    const now = Date.now();
    await db.tasks.update(id, {
      deleted_at: now,
      updated_at: now,
    });
  }

  // ---------- day plan ----------

  async dayPlan(dayKey: string): Promise<DayPlan> {
    const dayRow = await db.days.get(dayKey);
    const taskRows = await db.tasks
      .filter((t) => t.scheduled_date === dayKey && t.deleted_at === null)
      .sortBy('active_order');

    const tasks: DayTask[] = taskRows.map((r) => ({
      taskId: r.id,
      title: r.title,
      done: r.status === 'completed',
      sort: r.active_order || 0,
      notes: r.notes || '',
      isBoulder: !!r.is_boulder,
      reminderTime: r.reminder_time,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    if (!dayRow || dayRow.deleted_at !== null) {
      return {
        dayKey,
        planned: false,
        boulderId: null,
        prediction: null,
        tasks: [],
        closed: false,
        outcome: null,
        whys: [],
        note: '',
        boulder: null,
        others: [],
        boulderDone: false,
      };
    }

    let whys: string[] = [];
    try {
      whys = JSON.parse(dayRow.whys || '[]');
    } catch (_) {
      whys = [];
    }

    const boulder = tasks.find((t) => t.taskId === dayRow.boulder_id) || null;
    const others = tasks.filter((t) => t.taskId !== dayRow.boulder_id);
    const boulderDone = boulder?.done ?? false;

    return {
      dayKey,
      planned: dayRow.planned === 1,
      boulderId: dayRow.boulder_id,
      prediction: dayRow.prediction,
      tasks,
      closed: dayRow.closed_at !== null,
      outcome: dayRow.outcome === null ? null : dayRow.outcome === 1,
      whys,
      note: dayRow.note || '',
      boulder,
      others,
      boulderDone,
      createdAt: dayRow.created_at,
      updatedAt: dayRow.updated_at,
      deletedAt: dayRow.deleted_at,
    };
  }

  async planDay({
    dayKey,
    selected,
    boulderId,
    prediction,
  }: {
    dayKey: string;
    selected: BacklogItem[];
    boulderId: string;
    prediction: number;
  }): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', db.tasks, db.days, async () => {
      const selectedIds = new Set(selected.map((s) => s.id));

      // Reset any tasks previously scheduled for this day that are no longer selected
      const currentDayTasks = await db.tasks
        .filter((t) => t.scheduled_date === dayKey && !selectedIds.has(t.id))
        .toArray();

      for (const t of currentDayTasks) {
        await db.tasks.update(t.id, {
          scheduled_date: null,
          is_boulder: false,
          updated_at: now,
        });
      }

      // Assign selected tasks to today with active order and boulder flag
      for (let i = 0; i < selected.length; i++) {
        const item = selected[i];
        const isBoulder = item.id === boulderId;
        const existing = await db.tasks.get(item.id);

        if (existing) {
          await db.tasks.update(item.id, {
            scheduled_date: dayKey,
            active_order: i,
            is_boulder: isBoulder,
            updated_at: now,
          });
        } else {
          await db.tasks.add({
            id: item.id,
            title: item.title,
            notes: item.notes || '',
            is_boulder: isBoulder,
            status: 'pending',
            scheduled_date: dayKey,
            reminder_time: null,
            active_order: i,
            created_at: now,
            updated_at: now,
            deleted_at: null,
          });
        }
      }

      const existingDay = await db.days.get(dayKey);
      const dayData: DbDay = {
        day_key: dayKey,
        planned: 1,
        boulder_id: boulderId,
        prediction,
        closed_at: existingDay?.closed_at || null,
        outcome: existingDay?.outcome || null,
        whys: existingDay?.whys || '[]',
        note: existingDay?.note || '',
        created_at: existingDay?.created_at || now,
        updated_at: now,
        deleted_at: null,
      };
      await db.days.put(dayData);
    });
  }

  async setTaskDone(dayKey: string, taskId: string, done: boolean): Promise<void> {
    const now = Date.now();
    await db.tasks.update(taskId, {
      status: done ? 'completed' : 'pending',
      updated_at: now,
    });
  }

  async renameTask(dayKey: string, taskId: string, title: string): Promise<void> {
    const now = Date.now();
    await db.tasks.update(taskId, {
      title,
      updated_at: now,
    });
  }

  async updateTaskReminder(taskId: string, reminderMinutes: number | null): Promise<void> {
    const now = Date.now();
    await db.tasks.update(taskId, {
      reminder_time: reminderMinutes,
      updated_at: now,
    });
  }

  async getTask(taskId: string): Promise<Task | undefined> {
    return db.tasks.get(taskId);
  }

  async removeTaskFromDay(dayKey: string, taskId: string): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', db.tasks, db.days, async () => {
      await db.tasks.update(taskId, {
        scheduled_date: null,
        is_boulder: false,
        deleted_at: now,
        updated_at: now,
      });

      const day = await db.days.get(dayKey);
      if (!day || day.boulder_id !== taskId) return;

      const remaining = await db.tasks
        .filter((t) => t.scheduled_date === dayKey && t.deleted_at === null)
        .sortBy('active_order');

      if (remaining.length === 0) {
        await db.days.update(dayKey, {
          boulder_id: null,
          planned: 0,
          updated_at: now,
        });
      } else {
        const newBoulder = remaining[0];
        await db.tasks.update(newBoulder.id, {
          is_boulder: true,
          updated_at: now,
        });
        await db.days.update(dayKey, {
          boulder_id: newBoulder.id,
          updated_at: now,
        });
      }
    });
  }

  async addTaskToDay(dayKey: string, item: BacklogItem): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', db.tasks, async () => {
      const dayTasks = await db.tasks
        .filter((t) => t.scheduled_date === dayKey && t.deleted_at === null)
        .toArray();
      const maxOrder = dayTasks.reduce((max, t) => Math.max(max, t.active_order || 0), -1);

      const existing = await db.tasks.get(item.id);
      if (existing) {
        await db.tasks.update(item.id, {
          scheduled_date: dayKey,
          active_order: maxOrder + 1,
          updated_at: now,
        });
      } else {
        await db.tasks.add({
          id: item.id,
          title: item.title,
          notes: item.notes || '',
          is_boulder: false,
          status: 'pending',
          scheduled_date: dayKey,
          reminder_time: null,
          active_order: maxOrder + 1,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        });
      }
    });
  }

  async closeDay({
    dayKey,
    whys,
    note,
  }: {
    dayKey: string;
    whys: string[];
    note: string;
  }): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', db.tasks, db.days, async () => {
      const day = await db.days.get(dayKey);
      if (!day) return;

      const boulder = day.boulder_id ? await db.tasks.get(day.boulder_id) : null;
      const outcome = boulder ? boulder.status === 'completed' : false;

      await db.days.update(dayKey, {
        closed_at: now,
        outcome: outcome ? 1 : 0,
        whys: JSON.stringify(whys),
        note,
        updated_at: now,
      });
    });
  }

  // ---------- thoughts ----------

  async thoughts(): Promise<Thought[]> {
    return db.thoughts
      .filter((t) => t.deleted_at === null)
      .reverse()
      .sortBy('created_at');
  }

  async addThought(text: string, category: ThoughtCategory): Promise<Thought> {
    const now = Date.now();
    const thought: Thought = {
      id: generateId(),
      text,
      category,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.thoughts.add(thought);
    return thought;
  }

  async updateThought(id: string, text: string, category: ThoughtCategory): Promise<void> {
    const now = Date.now();
    await db.thoughts.update(id, {
      text,
      category,
      updated_at: now,
    });
  }

  async deleteThought(id: string): Promise<void> {
    const now = Date.now();
    await db.thoughts.update(id, {
      deleted_at: now,
      updated_at: now,
    });
  }

  async restoreThought(t: Thought): Promise<void> {
    const now = Date.now();
    await db.thoughts.put({
      ...t,
      updated_at: now,
      deleted_at: null,
    });
  }

  async activeDaysCount(): Promise<number> {
    return db.days
      .filter((d) => d.closed_at !== null && d.deleted_at === null)
      .count();
  }

  async promoteThought(t: Thought, dayKey: string): Promise<boolean> {
    const plan = await this.dayPlan(dayKey);
    const item = await this.addBacklog(t.text);
    await this.deleteThought(t.id);

    const active = await this.activeDaysCount();
    const maxTasks = maxTasksForActiveDays(active);
    const hasRoom = plan.planned && !plan.closed && plan.tasks.length < maxTasks;

    if (hasRoom) {
      await this.addTaskToDay(dayKey, item);
    }
    return hasRoom;
  }

  // ---------- focus sessions ----------

  async startFocusSession({
    dayKey,
    taskId,
    title,
    plannedMin,
    kind = 'task',
  }: {
    dayKey: string;
    taskId: string | null;
    title: string;
    plannedMin: number;
    kind?: 'task' | 'fun';
  }): Promise<string> {
    const id = generateId();
    const now = Date.now();
    const session: FocusSession = {
      id,
      task_id: taskId,
      duration_seconds: 0,
      completed_at: null,
      day_key: dayKey,
      title,
      planned_min: plannedMin,
      started_at: now,
      ended_at: null,
      completed: false,
      interrupt_note: null,
      interrupt_tag: null,
      kind,
      created_at: now,
      updated_at: now,
    };
    await db.focus_sessions.add(session);
    return id;
  }

  async endFocusSession({
    sessionId,
    completed,
    interruptNote,
    interruptTag,
    endedAtMs,
  }: {
    sessionId: string;
    completed: boolean;
    interruptNote?: string | null;
    interruptTag?: InterruptTag | null;
    endedAtMs?: number;
  }): Promise<void> {
    const now = Date.now();
    const endedAt = endedAtMs || now;
    const session = await db.focus_sessions.get(sessionId);

    let durationSec = 0;
    if (session) {
      durationSec = Math.min(Math.max(Math.round((endedAt - session.started_at) / 1000), 0), 86400);
    }

    await db.focus_sessions.update(sessionId, {
      ended_at: endedAt,
      duration_seconds: durationSec,
      completed_at: completed ? endedAt : null,
      completed,
      interrupt_note: interruptNote || null,
      interrupt_tag: interruptTag || null,
      updated_at: now,
    });
  }

  // ---------- habits ----------

  async habits(): Promise<Habit[]> {
    const habitRows = await db.habits
      .filter((h) => h.deleted_at === null)
      .sortBy('sort');

    const logRows = await db.habit_logs
      .filter((l) => l.deleted_at === null)
      .toArray();

    const logsMap: Record<string, Record<string, string>> = {};
    for (const l of logRows) {
      if (!logsMap[l.habit_id]) logsMap[l.habit_id] = {};
      logsMap[l.habit_id][l.day_key] = l.status;
    }

    return habitRows.map((h) => ({
      ...h,
      logs: logsMap[h.id] || {},
    }));
  }

  async addHabit({
    title,
    cue,
    isBad,
    badCost,
    replacement,
    reminderMinutes,
    frequency = 'daily',
  }: {
    title: string;
    cue: string;
    isBad: boolean;
    badCost: string;
    replacement: string;
    reminderMinutes: number | null;
    frequency?: string;
  }): Promise<Habit> {
    const now = Date.now();
    const existing = await db.habits.filter((h) => h.deleted_at === null).toArray();
    const maxSort = existing.reduce((max, h) => Math.max(max, h.sort || 0), -1);

    const habit: Habit = {
      id: generateId(),
      title,
      cue,
      created: todayKey(),
      frequency,
      recovery_count: 0,
      is_bad: isBad,
      bad_cost: badCost,
      replacement,
      reminder_minutes: reminderMinutes,
      sort: maxSort + 1,
      logs: {},
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.habits.add(habit);
    return habit;
  }

  async updateHabit({
    id,
    title,
    cue,
    isBad,
    badCost,
    replacement,
    reminderMinutes,
    frequency = 'daily',
  }: {
    id: string;
    title: string;
    cue: string;
    isBad: boolean;
    badCost: string;
    replacement: string;
    reminderMinutes: number | null;
    frequency?: string;
  }): Promise<void> {
    const now = Date.now();
    await db.habits.update(id, {
      title,
      cue,
      frequency,
      is_bad: isBad,
      bad_cost: badCost,
      replacement,
      reminder_minutes: reminderMinutes,
      updated_at: now,
    });
  }

  async deleteHabit(id: string): Promise<void> {
    const now = Date.now();
    await db.habits.update(id, {
      deleted_at: now,
      updated_at: now,
    });
  }

  async logHabit(habitId: string, dayKey: string, status: 'done' | 'slip' | 'resisted' | null): Promise<void> {
    const now = Date.now();
    const id = `${habitId}_${dayKey}`;
    if (status === null) {
      await db.habit_logs.delete(id);
    } else {
      await db.habit_logs.put({
        id,
        habit_id: habitId,
        day_key: dayKey,
        status,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }
  }

  // ---------- leisure / fun ----------

  async funConfig(): Promise<FunConfig> {
    const rows = await db.leisure
      .filter((l) => l.deleted_at === null)
      .reverse()
      .sortBy('updated_at');

    if (rows.length > 0) {
      return {
        title: rows[0].title,
        minutes: rows[0].duration_minutes,
      };
    }

    const fallbackSetting = await this.getSetting('fun');
    if (fallbackSetting) {
      try {
        return JSON.parse(fallbackSetting);
      } catch (_) {}
    }

    return {
      title: 'تفریح بدون عذاب وجدان',
      minutes: 30,
    };
  }

  async setFunConfig(fun: FunConfig): Promise<void> {
    const now = Date.now();
    const rows = await db.leisure.filter((l) => l.deleted_at === null).toArray();
    if (rows.length > 0) {
      await db.leisure.update(rows[0].id, {
        title: fun.title,
        duration_minutes: fun.minutes,
        updated_at: now,
      });
    } else {
      await db.leisure.add({
        id: generateId(),
        title: fun.title,
        duration_minutes: fun.minutes,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }
    await this.setSetting('fun', JSON.stringify(fun));
  }

  // ---------- settings ----------

  async getSetting(key: string): Promise<string | null> {
    const row = await db.settings.get(key);
    return row ? row.v : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const now = Date.now();
    await db.settings.put({
      k: key,
      v: value,
      updated_at: now,
    });
  }

  async reminderMinutes(key: string, fallback: number): Promise<number | null> {
    const raw = await this.getSetting(key);
    if (raw === null) return fallback;
    if (raw === 'off') return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  async setReminderMinutes(key: string, minutes: number | null): Promise<void> {
    await this.setSetting(key, minutes === null ? 'off' : String(minutes));
  }

  // ---------- energy checks ----------

  async addEnergyCheck(level: number): Promise<void> {
    const now = Date.now();
    const hour = new Date().getHours();
    await db.energy_checks.add({
      id: generateId(),
      day_key: todayKey(),
      hour,
      level,
      created_at: now,
      updated_at: now,
    });
  }

  // ---------- stats mirror ----------

  async markReviewDone(): Promise<void> {
    await this.setSetting('last_review', todayKey());
  }

  async stats(): Promise<StatsData> {
    const today = todayKey();

    // Closed nights
    const closed = await db.days
      .filter((d) => d.closed_at !== null && d.prediction !== null && d.deleted_at === null)
      .reverse()
      .sortBy('day_key');

    const closedCount = closed.length;
    let winRate: number | null = null;
    let avgPrediction: number | null = null;
    let gap: number | null = null;

    if (closedCount > 0) {
      const wins = closed.filter((r) => r.outcome === 1).length;
      winRate = Math.round((wins / closedCount) * 100);
      const sumPred = closed.reduce((acc, r) => acc + (r.prediction || 0), 0);
      avgPrediction = Math.round(sumPred / closedCount);
      gap = avgPrediction - winRate;
    }

    const lastNights: NightRow[] = closed.slice(0, 7).map((r) => ({
      dayKey: r.day_key,
      prediction: r.prediction || 0,
      outcome: r.outcome === 1,
    }));

    // Habit recovery rate
    const allHabits = await this.habits();
    let misses = 0;
    let recoveries = 0;
    const fortyFiveDaysAgo = shiftDayKey(today, -45);

    for (const h of allHabits.filter((x) => !x.is_bad)) {
      let key = h.created.localeCompare(fortyFiveDaysAgo) > 0 ? h.created : fortyFiveDaysAgo;
      while (key.localeCompare(today) < 0) {
        const doneToday = h.logs?.[key] === 'done';
        if (!doneToday) {
          misses++;
          const nextDayKey = shiftDayKey(key, 1);
          if (h.logs?.[nextDayKey] === 'done') {
            recoveries++;
          }
        }
        key = shiftDayKey(key, 1);
      }
    }

    const recoveryRate = misses > 0 ? Math.round((recoveries / misses) * 100) : null;

    // Focus minutes last 7 days
    const weekStart = shiftDayKey(today, -6);
    const sessions = await db.focus_sessions
      .filter((s) => s.ended_at !== null && s.kind === 'task' && s.day_key >= weekStart)
      .toArray();

    const focusMinutesLast7 = [0, 0, 0, 0, 0, 0, 0];
    for (const s of sessions) {
      const d1 = new Date(today).getTime();
      const d2 = new Date(s.day_key).getTime();
      const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
      const idx = 6 - diffDays;
      if (idx >= 0 && idx < 7) {
        const ms = (s.ended_at || 0) - s.started_at;
        focusMinutesLast7[idx] += Math.min(Math.max(Math.round(ms / 60000), 0), 1440);
      }
    }

    // Interrupt patterns last 30 days
    const thirtyDaysAgo = shiftDayKey(today, -30);
    const tagSessions = await db.focus_sessions
      .filter((s) => s.interrupt_tag !== null && s.day_key >= thirtyDaysAgo)
      .toArray();

    const interruptCounts: Partial<Record<InterruptTag, number>> = {};
    for (const s of tagSessions) {
      if (s.interrupt_tag) {
        interruptCounts[s.interrupt_tag] = (interruptCounts[s.interrupt_tag] || 0) + 1;
      }
    }

    const notesSessions = await db.focus_sessions
      .filter((s) => Boolean(s.interrupt_note && s.interrupt_note.trim()))
      .reverse()
      .sortBy('started_at');

    const recentInterrupts = notesSessions.slice(0, 5).map((s) => s.interrupt_note!);

    // Golden hour calculation
    const checks = await db.energy_checks
      .filter((c) => c.day_key >= thirtyDaysAgo)
      .toArray();

    let goldenHour: number | null = null;
    if (checks.length >= 6) {
      const sums = Array(8).fill(0);
      const counts = Array(8).fill(0);
      for (const c of checks) {
        const bucket = Math.floor(c.hour / 3);
        sums[bucket] += c.level;
        counts[bucket]++;
      }
      let best = -1;
      for (let i = 0; i < 8; i++) {
        if (counts[i] === 0) continue;
        const avg = sums[i] / counts[i];
        if (avg > best) {
          best = avg;
          goldenHour = i * 3;
        }
      }
    }

    // Zero-based review due
    const lastReview = await this.getSetting('last_review');
    let reviewDue = false;
    if (lastReview === null && closedCount >= 6) {
      reviewDue = true;
    } else if (lastReview !== null) {
      const diff = Math.round(
        (new Date(today).getTime() - new Date(lastReview).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff >= 7) reviewDue = true;
    }

    const focusMinutesWeek = focusMinutesLast7.reduce((a, b) => a + b, 0);

    return {
      closedCount,
      winRate,
      avgPrediction,
      gap,
      recoveryRate,
      lastNights,
      focusMinutesLast7,
      recentInterrupts,
      interruptCounts,
      goldenHour,
      reviewDue,
      focusMinutesWeek,
      optimismReliable: closedCount >= 5,
    };
  }

  // ---------- JSON export / import ----------

  async exportJson(): Promise<string> {
    const tasks = await db.tasks.toArray();
    const days = await db.days.toArray();
    const thoughts = await db.thoughts.toArray();
    const focus_sessions = await db.focus_sessions.toArray();
    const habits = await db.habits.toArray();
    const habit_logs = await db.habit_logs.toArray();
    const leisure = await db.leisure.toArray();
    const energy_checks = await db.energy_checks.toArray();
    const settings = await db.settings.toArray();

    return JSON.stringify(
      {
        app: 'taknoghte',
        version: 2,
        exportedAt: new Date().toISOString(),
        tables: {
          tasks,
          days,
          thoughts,
          focus_sessions,
          habits,
          habit_logs,
          leisure,
          energy_checks,
          settings,
        },
      },
      null,
      2
    );
  }

  async importJson(raw: string): Promise<void> {
    let decoded: any;
    try {
      decoded = JSON.parse(raw);
    } catch (_) {
      throw new Error('Invalid JSON');
    }

    if (!decoded || decoded.app !== 'taknoghte' || !decoded.tables) {
      throw new Error('Not a valid Taknoghte backup');
    }

    const tables = decoded.tables;
    await db.transaction(
      'rw',
      [
        db.tasks,
        db.days,
        db.thoughts,
        db.focus_sessions,
        db.habits,
        db.habit_logs,
        db.leisure,
        db.energy_checks,
        db.settings,
      ],
      async () => {
        if (tables.tasks) {
          await db.tasks.clear();
          await db.tasks.bulkPut(tables.tasks);
        }
        if (tables.days) {
          await db.days.clear();
          await db.days.bulkPut(tables.days);
        }
        if (tables.thoughts) {
          await db.thoughts.clear();
          await db.thoughts.bulkPut(tables.thoughts);
        }
        if (tables.focus_sessions) {
          await db.focus_sessions.clear();
          await db.focus_sessions.bulkPut(tables.focus_sessions);
        }
        if (tables.habits) {
          await db.habits.clear();
          await db.habits.bulkPut(tables.habits);
        }
        if (tables.habit_logs) {
          await db.habit_logs.clear();
          await db.habit_logs.bulkPut(tables.habit_logs);
        }
        if (tables.leisure) {
          await db.leisure.clear();
          await db.leisure.bulkPut(tables.leisure);
        }
        if (tables.energy_checks) {
          await db.energy_checks.clear();
          await db.energy_checks.bulkPut(tables.energy_checks);
        }
        if (tables.settings) {
          await db.settings.clear();
          await db.settings.bulkPut(tables.settings);
        }
      }
    );
  }
}

export const repo = new Repo();
