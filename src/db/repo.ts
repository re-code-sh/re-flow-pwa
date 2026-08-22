import { db, DbDay, DbSetting } from './index';
import {
  Task,
  BacklogItem,
  DayPlan,
  DayTask,
  Habit,
  HabitLog,
  FunConfig,
  Thought,
  ThoughtCategory,
  StatsData,
  WeeklyReview,
  EnergyCheck,
  InterruptTag,
} from '../core/types';
import { todayKey, shiftDayKey } from '../core/jalali';

function generateUUID(): string {
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
  if (activeDays < 3) return 3;
  if (activeDays < 7) return 4;
  return 5;
}

export class Repo {
  // ---------- Backlog ----------

  async backlog(): Promise<BacklogItem[]> {
    const rows = await db.tasks
      .filter((t) => t.deleted_at === null && (t.status === 'pending' || t.scheduled_date === null))
      .sortBy('created_at');

    return rows.reverse().map((r) => ({
      id: r.id,
      title: r.title,
      notes: r.notes || '',
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  async addBacklog(title: string, notes: string = ''): Promise<BacklogItem> {
    const now = Date.now();
    const id = generateUUID();
    const task: Task = {
      id,
      title: title.trim(),
      notes: notes.trim(),
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
      title: task.title,
      notes: task.notes,
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

  // ---------- Day Plan ----------

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

      // 1. Clear previous tasks scheduled for today that are no longer selected
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

      // 2. Schedule selected tasks
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

      // 3. Upsert Day record
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
      title: title.trim(),
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
      const isWinner = boulder?.status === 'completed';

      await db.days.update(dayKey, {
        closed_at: now,
        outcome: isWinner ? 1 : 0,
        whys: JSON.stringify(whys),
        note: note.trim(),
        updated_at: now,
      });
    });
  }

  async activeDaysCount(): Promise<number> {
    const closedCount = await db.days
      .filter((d) => d.closed_at !== null && d.deleted_at === null)
      .count();
    return closedCount;
  }

  // ---------- Habits ----------

  async habits(): Promise<Habit[]> {
    const habitRows = await db.habits
      .filter((h) => h.deleted_at === null)
      .sortBy('created_at');

    const habitIds = habitRows.map((h) => h.id);
    const logs = await db.habit_logs
      .filter((l) => habitIds.includes(l.habit_id))
      .toArray();

    const logsMap = new Map<string, Record<string, 'done' | 'resisted' | 'slip'>>();
    for (const log of logs) {
      if (!logsMap.has(log.habit_id)) {
        logsMap.set(log.habit_id, {});
      }
      logsMap.get(log.habit_id)![log.day_key] = log.status as any;
    }

    return habitRows.map((h) => ({
      id: h.id,
      title: h.title,
      cue: h.cue || '',
      created: h.created || todayKey(),
      is_bad: !!h.is_bad,
      bad_cost: h.bad_cost || '',
      bad_replace: h.bad_replace || h.replacement || '',
      replacement: h.replacement || h.bad_replace || '',
      reminder_minutes: h.reminder_minutes,
      created_at: h.created_at,
      updated_at: h.updated_at,
      logs: logsMap.get(h.id) || {},
    }));
  }

  async addHabit(data: {
    title: string;
    cue?: string;
    isBad?: boolean;
    badCost?: string;
    replacement?: string;
    reminderMinutes?: number | null;
  }): Promise<Habit> {
    const now = Date.now();
    const id = generateUUID();
    const isBadVal = !!data.isBad;
    const habit: Habit = {
      id,
      title: data.title.trim(),
      cue: data.cue?.trim() || '',
      created: todayKey(),
      is_bad: isBadVal,
      bad_cost: data.badCost?.trim() || '',
      bad_replace: data.replacement?.trim() || '',
      replacement: data.replacement?.trim() || '',
      reminder_minutes: data.reminderMinutes ?? null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.habits.add(habit);
    return {
      ...habit,
      logs: {},
    };
  }

  async updateHabit(data: {
    id: string;
    title?: string;
    cue?: string;
    isBad?: boolean;
    badCost?: string;
    replacement?: string;
    reminderMinutes?: number | null;
  }): Promise<void> {
    const now = Date.now();
    await db.habits.update(data.id, {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.cue !== undefined && { cue: data.cue.trim() }),
      ...(data.isBad !== undefined && { is_bad: data.isBad }),
      ...(data.badCost !== undefined && { bad_cost: data.badCost.trim() }),
      ...(data.replacement !== undefined && {
        bad_replace: data.replacement.trim(),
        replacement: data.replacement.trim(),
      }),
      ...(data.reminderMinutes !== undefined && { reminder_minutes: data.reminderMinutes }),
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

  async logHabit(
    habitId: string,
    dayKey: string,
    status: 'done' | 'resisted' | 'slip' | null
  ): Promise<void> {
    const existing = await db.habit_logs
      .filter((l) => l.habit_id === habitId && l.day_key === dayKey)
      .first();

    if (status === null) {
      if (existing && existing.id) await db.habit_logs.delete(existing.id);
      return;
    }

    const now = Date.now();
    if (existing && existing.id) {
      await db.habit_logs.update(existing.id, {
        status,
        updated_at: now,
      });
    } else {
      await db.habit_logs.add({
        id: generateUUID(),
        habit_id: habitId,
        day_key: dayKey,
        status,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }
  }

  // ---------- Leisure / Fun Config ----------

  async funConfig(): Promise<FunConfig> {
    const setting = await db.settings.get('fun_config');
    if (!setting) return { title: 'تفریح بدون عذاب وجدان', minutes: 30 };
    try {
      return JSON.parse(setting.v);
    } catch (_) {
      return { title: 'تفریح بدون عذاب وجدان', minutes: 30 };
    }
  }

  async setFunConfig(cfg: FunConfig): Promise<void> {
    await db.settings.put({
      k: 'fun_config',
      v: JSON.stringify(cfg),
      updated_at: Date.now(),
    });
  }

  // ---------- Brain Vault Thoughts ----------

  async thoughts(): Promise<Thought[]> {
    const rows = await db.thoughts
      .filter((t) => t.deleted_at === null)
      .sortBy('created_at');

    return rows.reverse().map((r) => ({
      id: r.id,
      text: r.text,
      category: r.category as ThoughtCategory,
      created_at: r.created_at,
    }));
  }

  async addThought(text: string, category: ThoughtCategory): Promise<Thought> {
    const now = Date.now();
    const id = generateUUID();
    const thought: Thought = {
      id,
      text: text.trim(),
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
      text: text.trim(),
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

  async restoreThought(th: Thought): Promise<void> {
    const now = Date.now();
    const existing = await db.thoughts.get(th.id);
    if (existing) {
      await db.thoughts.update(th.id, {
        deleted_at: null,
        updated_at: now,
      });
    } else {
      await db.thoughts.add({
        id: th.id,
        text: th.text,
        category: th.category,
        created_at: th.created_at,
        updated_at: now,
        deleted_at: null,
      });
    }
  }

  async promoteThought(th: Thought, todayKeyStr: string): Promise<boolean> {
    const plan = await this.dayPlan(todayKeyStr);
    const maxSlots = maxTasksForActiveDays(await this.activeDaysCount());

    if (plan.planned && plan.tasks.length < maxSlots) {
      await this.addTaskToDay(todayKeyStr, {
        id: generateUUID(),
        title: th.text,
        notes: `مخزن ذهن: ${th.category}`,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      await this.deleteThought(th.id);
      return true;
    } else {
      await this.addBacklog(th.text, `مخزن ذهن: ${th.category}`);
      await this.deleteThought(th.id);
      return false;
    }
  }

  async addTaskToDay(dayKey: string, item: BacklogItem): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', db.tasks, async () => {
      const dayTasks = await db.tasks
        .filter((t) => t.scheduled_date === dayKey && t.deleted_at === null)
        .toArray();
      const maxOrder = dayTasks.reduce((max, t) => Math.max(max, t.active_order || 0), -1);

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
    });
  }

  // ---------- Energy Checks ----------

  async logEnergy(dayKey: string, hour: number, level: number): Promise<void> {
    const now = Date.now();
    const id = `${dayKey}_${hour}`;
    const energyCheck: EnergyCheck = {
      id,
      day_key: dayKey,
      hour,
      level,
      created_at: now,
      updated_at: now,
    };
    await db.energy_checks.put(energyCheck);
  }

  async addEnergyCheck(level: number): Promise<void> {
    const hour = new Date().getHours();
    await this.logEnergy(todayKey(), hour, level);
  }

  // ---------- Focus Sessions Engine ----------

  async startFocusSession({
    dayKey,
    taskId,
    title,
    plannedMin,
    kind,
  }: {
    dayKey: string;
    taskId: string | null;
    title: string;
    plannedMin: number;
    kind: 'task' | 'fun';
  }): Promise<string> {
    const now = Date.now();
    const sessionId = generateUUID();
    await db.focus_sessions.add({
      id: sessionId,
      task_id: taskId,
      day_key: dayKey,
      title,
      planned_min: plannedMin,
      started_at: now,
      ended_at: null,
      completed_at: null,
      duration_seconds: plannedMin * 60,
      completed: false,
      interrupt_note: null,
      interrupt_tag: null,
      kind,
      created_at: now,
      updated_at: now,
    });
    return sessionId;
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
    const now = endedAtMs || Date.now();
    await db.focus_sessions.update(sessionId, {
      ended_at: now,
      completed,
      completed_at: completed ? now : null,
      interrupt_note: interruptNote || null,
      interrupt_tag: interruptTag || null,
      updated_at: now,
    });
  }

  // ---------- Stats & Mirror ----------

  async stats(): Promise<StatsData> {
    const days = await db.days
      .filter((d) => d.deleted_at === null)
      .sortBy('day_key');

    const closedDays = days.filter((d) => d.closed_at !== null);

    // 1. Win Rate
    let winRate: number | null = null;
    if (closedDays.length > 0) {
      const wins = closedDays.filter((d) => d.outcome === 1).length;
      winRate = Math.round((wins / closedDays.length) * 100);
    }

    // 2. Optimism Gap
    let gap: number | null = null;
    const optimismReliable = closedDays.length >= 5;
    if (closedDays.length > 0) {
      const totalPred = closedDays.reduce((sum, d) => sum + (d.prediction ?? 70), 0);
      const avgPred = totalPred / closedDays.length;
      const actualWin = ((closedDays.filter((d) => d.outcome === 1).length) / closedDays.length) * 100;
      gap = Math.round(avgPred - actualWin);
    }

    // 3. Recovery Rate
    let recoveryRate: number | null = null;
    let losses = 0;
    let recoveries = 0;
    for (let i = 0; i < closedDays.length - 1; i++) {
      if (closedDays[i].outcome === 0) {
        losses++;
        if (closedDays[i + 1].outcome === 1) {
          recoveries++;
        }
      }
    }
    if (losses > 0) {
      recoveryRate = Math.round((recoveries / losses) * 100);
    }

    // 4. Focus minutes in last 7 days
    const today = todayKey();
    const focusMinutesLast7: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const k = shiftDayKey(today, -i);
      const sessions = await db.focus_sessions
        .filter((s) => s.day_key === k)
        .toArray();
      const mins = sessions.reduce((acc, s) => acc + Math.round((s.duration_seconds || 0) / 60), 0);
      focusMinutesLast7.push(mins);
    }
    const focusMinutesWeek = focusMinutesLast7.reduce((a, b) => a + b, 0);

    // 5. Golden Hour (peak energy)
    const energy = await db.energy_checks.toArray();
    let goldenHour: number | null = null;
    if (energy.length >= 3) {
      const hourScores = new Map<number, { sum: number; count: number }>();
      for (const e of energy) {
        const curr = hourScores.get(e.hour) || { sum: 0, count: 0 };
        hourScores.set(e.hour, { sum: curr.sum + e.level, count: curr.count + 1 });
      }
      let maxScore = -1;
      for (const [hour, { sum, count }] of hourScores.entries()) {
        const avg = sum / count;
        if (avg > maxScore) {
          maxScore = avg;
          goldenHour = hour;
        }
      }
    }

    // 6. 30-Day Interruption counts
    const thirtyDaysAgo = shiftDayKey(today, -30);
    const recentSessions = await db.focus_sessions
      .filter((s) => s.day_key >= thirtyDaysAgo)
      .toArray();

    const interruptCounts: Partial<Record<InterruptTag, number>> = {};
    for (const s of recentSessions) {
      if (s.interrupt_tag) {
        interruptCounts[s.interrupt_tag] = (interruptCounts[s.interrupt_tag] || 0) + 1;
      }
    }

    // 7. Last 7 closed nights
    const lastNights = closedDays
      .slice(-7)
      .reverse()
      .map((d) => ({
        dayKey: d.day_key,
        outcome: d.outcome === 1,
        prediction: d.prediction ?? 70,
        whys: JSON.parse(d.whys || '[]'),
        note: d.note || '',
      }));

    // 8. Weekly Review Due check
    const lastReview = await db.weekly_reviews.orderBy('created_at').last();
    const daysSinceReview = lastReview
      ? (Date.now() - lastReview.created_at) / (1000 * 60 * 60 * 24)
      : 8;
    const reviewDue = closedDays.length >= 4 && daysSinceReview >= 7;

    return {
      winRate,
      optimismGap: gap,
      optimismReliable,
      recoveryRate,
      focusMinutesLast7,
      focusMinutesWeek,
      goldenHour,
      interruptCounts,
      lastNights,
      reviewDue,
      gap,
    };
  }

  async markReviewDone(): Promise<void> {
    await db.weekly_reviews.add({
      id: generateUUID(),
      kept_count: 0,
      pruned_count: 0,
      created_at: Date.now(),
    });
  }

  // ---------- Settings ----------

  async getSetting(key: string): Promise<string | undefined> {
    const s = await db.settings.get(key);
    return s?.v;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db.settings.put({
      k: key,
      v: value,
      updated_at: Date.now(),
    });
  }

  async reminderMinutes(key: string, fallback: number): Promise<number | null> {
    const val = await this.getSetting(key);
    if (val === undefined) return fallback;
    if (val === 'off' || val === 'null') return null;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  async setReminderMinutes(key: string, minutes: number | null): Promise<void> {
    await this.setSetting(key, minutes === null ? 'off' : String(minutes));
  }

  // ---------- Backup & JSON Export / Restore ----------

  async exportJson(): Promise<string> {
    const [tasks, days, habits, habitLogs, thoughts, focusSessions, energyChecks, settings, weeklyReviews] =
      await Promise.all([
        db.tasks.toArray(),
        db.days.toArray(),
        db.habits.toArray(),
        db.habit_logs.toArray(),
        db.thoughts.toArray(),
        db.focus_sessions.toArray(),
        db.energy_checks.toArray(),
        db.settings.toArray(),
        db.weekly_reviews.toArray(),
      ]);

    const backup = {
      app: 'taknoghte',
      version: 2,
      exported_at: Date.now(),
      tables: {
        tasks,
        days,
        habits,
        habit_logs: habitLogs,
        thoughts,
        focus_sessions: focusSessions,
        energy_checks: energyChecks,
        settings,
        weekly_reviews: weeklyReviews,
      },
    };

    return JSON.stringify(backup, null, 2);
  }

  async importJson(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    if (!data.tables || typeof data.tables !== 'object') {
      throw new Error('Invalid backup format');
    }

    const {
      tasks = [],
      days = [],
      habits = [],
      habit_logs = [],
      thoughts = [],
      focus_sessions = [],
      energy_checks = [],
      settings = [],
      weekly_reviews = [],
    } = data.tables;

    await db.transaction(
      'rw',
      [
        db.tasks,
        db.days,
        db.habits,
        db.habit_logs,
        db.thoughts,
        db.focus_sessions,
        db.energy_checks,
        db.settings,
        db.weekly_reviews,
      ],
      async () => {
        await Promise.all([
          db.tasks.clear(),
          db.days.clear(),
          db.habits.clear(),
          db.habit_logs.clear(),
          db.thoughts.clear(),
          db.focus_sessions.clear(),
          db.energy_checks.clear(),
          db.settings.clear(),
          db.weekly_reviews.clear(),
        ]);

        await Promise.all([
          db.tasks.bulkPut(tasks),
          db.days.bulkPut(days),
          db.habits.bulkPut(habits),
          db.habit_logs.bulkPut(habit_logs),
          db.thoughts.bulkPut(thoughts),
          db.focus_sessions.bulkPut(focus_sessions),
          db.energy_checks.bulkPut(energy_checks),
          db.settings.bulkPut(settings),
          db.weekly_reviews.bulkPut(weekly_reviews),
        ]);
      }
    );
  }
}

export const repo = new Repo();
