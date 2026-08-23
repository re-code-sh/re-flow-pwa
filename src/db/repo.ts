import { v4 as uuidv4 } from 'uuid';
import { db } from './index';
import type {
  BacklogItem,
  DayPlan,
  DayTask,
  ThoughtRecord,
  ThoughtCategoryType,
  HabitRecord,
  HabitWithLogs,
  FunConfig,
  StatsData,
  NightRow,
  InterruptTagType,
  TaskRecord,
} from './schema';
import { todayKey, shiftDayKey } from '../utils/fa';

export function maxTasksForActiveDays(activeDays: number): number {
  if (activeDays >= 30) return 5;
  if (activeDays >= 15) return 4;
  return 3;
}

export class Repo {
  // ---------- Tasks & Backlog ----------

  async backlog(): Promise<BacklogItem[]> {
    const rows = await db.tasks
      .filter((t) => t.status === 'pending' && t.deleted_at === null && (t.scheduled_date === null || t.scheduled_date === ''))
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
    const id = uuidv4();
    const item: TaskRecord = {
      id,
      title: title.trim(),
      notes: notes.trim(),
      is_boulder: 0,
      status: 'pending',
      scheduled_date: null,
      reminder_time: null,
      active_order: 0,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    await db.tasks.add(item);
    return {
      id,
      title: item.title,
      notes: item.notes,
      created_at: now,
      updated_at: now,
      deleted_at: null,
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
      .where('scheduled_date')
      .equals(dayKey)
      .filter((t) => t.deleted_at === null)
      .sortBy('active_order');

    const tasks: DayTask[] = taskRows.map((r) => ({
      taskId: r.id,
      title: r.title,
      done: r.status === 'completed',
      sort: r.active_order || 0,
      notes: r.notes || '',
      isBoulder: r.is_boulder === 1,
      reminderTime: r.reminder_time,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    if (!dayRow || dayRow.deleted_at !== null) {
      const boulder = tasks.find((t) => t.isBoulder) || null;
      return {
        dayKey,
        planned: false,
        boulderId: null,
        prediction: null,
        tasks,
        closed: false,
        outcome: null,
        whys: [],
        note: '',
        createdAt: 0,
        updatedAt: 0,
        deletedAt: null,
        boulder,
        others: tasks.filter((t) => !t.isBoulder),
        boulderDone: boulder?.done || false,
      };
    }

    let parsedWhys: string[] = [];
    try {
      parsedWhys = JSON.parse(dayRow.whys || '[]');
    } catch {
      parsedWhys = [];
    }

    const boulder = tasks.find((t) => t.taskId === dayRow.boulder_id) || null;
    const others = tasks.filter((t) => t.taskId !== dayRow.boulder_id);

    return {
      dayKey,
      planned: dayRow.planned === 1,
      boulderId: dayRow.boulder_id,
      prediction: dayRow.prediction,
      tasks,
      closed: dayRow.closed_at !== null,
      outcome: dayRow.outcome === null ? null : dayRow.outcome === 1,
      whys: parsedWhys,
      note: dayRow.note || '',
      createdAt: dayRow.created_at,
      updatedAt: dayRow.updated_at,
      deletedAt: dayRow.deleted_at,
      boulder,
      others,
      boulderDone: boulder?.done || false,
    };
  }

  async planDay({
    dayKey,
    selected,
    boulderId,
    prediction,
  }: {
    dayKey: string;
    selected: { id: string; title: string; notes?: string }[];
    boulderId: string;
    prediction: number;
  }): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', [db.tasks, db.days], async () => {
      const selectedIds = new Set(selected.map((s) => s.id));

      // Reset any tasks scheduled for this day that are no longer selected
      const currentDayTasks = await db.tasks.where('scheduled_date').equals(dayKey).toArray();
      for (const t of currentDayTasks) {
        if (!selectedIds.has(t.id)) {
          await db.tasks.update(t.id, {
            scheduled_date: null,
            is_boulder: 0,
            updated_at: now,
          });
        }
      }

      // Assign selected tasks
      for (let i = 0; i < selected.length; i++) {
        const item = selected[i];
        const isBoulder = item.id === boulderId;
        const existing = await db.tasks.get(item.id);

        if (existing) {
          await db.tasks.update(item.id, {
            scheduled_date: dayKey,
            active_order: i,
            is_boulder: isBoulder ? 1 : 0,
            updated_at: now,
          });
        } else {
          await db.tasks.add({
            id: item.id,
            title: item.title,
            notes: item.notes || '',
            is_boulder: isBoulder ? 1 : 0,
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

      // Upsert day record
      await db.days.put({
        day_key: dayKey,
        planned: 1,
        boulder_id: boulderId,
        prediction,
        closed_at: null,
        outcome: null,
        whys: '[]',
        note: '',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    });
  }

  async setTaskDone(taskId: string, done: boolean): Promise<void> {
    const now = Date.now();
    await db.tasks.update(taskId, {
      status: done ? 'completed' : 'pending',
      updated_at: now,
    });
  }

  async renameTask(taskId: string, title: string): Promise<void> {
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

  async getTask(taskId: string): Promise<TaskRecord | undefined> {
    return db.tasks.get(taskId);
  }

  async removeTaskFromDay(dayKey: string, taskId: string): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', [db.tasks, db.days], async () => {
      await db.tasks.update(taskId, {
        scheduled_date: null,
        is_boulder: 0,
        deleted_at: now,
        updated_at: now,
      });

      const dayRow = await db.days.get(dayKey);
      if (!dayRow || dayRow.boulder_id !== taskId) return;

      const remaining = await db.tasks
        .where('scheduled_date')
        .equals(dayKey)
        .filter((t) => t.deleted_at === null)
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
          is_boulder: 1,
          updated_at: now,
        });
        await db.days.update(dayKey, {
          boulder_id: newBoulder.id,
          updated_at: now,
        });
      }
    });
  }

  async addTaskToDay(dayKey: string, item: { id: string; title: string; notes?: string }): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', db.tasks, async () => {
      const dayTasks = await db.tasks
        .where('scheduled_date')
        .equals(dayKey)
        .filter((t) => t.deleted_at === null)
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
          is_boulder: 0,
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
    await db.transaction('rw', [db.tasks, db.days], async () => {
      const dayRow = await db.days.get(dayKey);
      if (!dayRow) return;

      const tasks = await db.tasks
        .where('scheduled_date')
        .equals(dayKey)
        .filter((t) => t.deleted_at === null)
        .toArray();

      const boulderTask = tasks.find((t) => t.id === dayRow.boulder_id);
      const outcome = boulderTask ? boulderTask.status === 'completed' : false;

      await db.days.update(dayKey, {
        closed_at: now,
        outcome: outcome ? 1 : 0,
        whys: JSON.stringify(whys),
        note: note.trim(),
        updated_at: now,
      });
    });
  }

  // ---------- Thoughts ----------

  async thoughts(): Promise<ThoughtRecord[]> {
    return db.thoughts
      .filter((t) => t.deleted_at === null)
      .reverse()
      .sortBy('created_at');
  }

  async addThought(text: string, category: ThoughtCategoryType): Promise<ThoughtRecord> {
    const now = Date.now();
    const thought: ThoughtRecord = {
      id: uuidv4(),
      text: text.trim(),
      category,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.thoughts.add(thought);
    return thought;
  }

  async updateThought(id: string, text: string, category: ThoughtCategoryType): Promise<void> {
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

  async activeDaysCount(): Promise<number> {
    return db.days
      .filter((d) => d.closed_at !== null && d.deleted_at === null)
      .count();
  }

  async promoteThought(thought: ThoughtRecord, dayKey: string): Promise<boolean> {
    const plan = await this.dayPlan(dayKey);
    const item = await this.addBacklog(thought.text);
    await this.deleteThought(thought.id);

    const activeDays = await this.activeDaysCount();
    const maxTasks = maxTasksForActiveDays(activeDays);
    const hasRoom = plan.planned && !plan.closed && plan.tasks.length < maxTasks;

    if (hasRoom) {
      await this.addTaskToDay(dayKey, item);
    }
    return hasRoom;
  }

  async restoreThought(thought: ThoughtRecord): Promise<void> {
    const now = Date.now();
    await db.thoughts.put({
      ...thought,
      updated_at: now,
      deleted_at: null,
    });
  }

  // ---------- Focus Sessions ----------

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
    const id = uuidv4();
    const now = Date.now();
    await db.focus_sessions.add({
      id,
      task_id: taskId,
      duration_seconds: 0,
      completed_at: null,
      day_key: dayKey,
      title: title.trim(),
      planned_min: plannedMin,
      started_at: now,
      ended_at: null,
      completed: 0,
      interrupt_note: null,
      interrupt_tag: null,
      kind,
      created_at: now,
      updated_at: now,
    });
    return id;
  }

  async endFocusSession({
    sessionId,
    completed,
    durationSeconds,
    interruptNote,
    interruptTag,
    endedAtMs,
  }: {
    sessionId: string;
    completed: boolean;
    durationSeconds?: number;
    interruptNote?: string;
    interruptTag?: InterruptTagType | string;
    endedAtMs?: number;
  }): Promise<void> {
    const now = Date.now();
    const endedAt = endedAtMs || now;
    const session = await db.focus_sessions.get(sessionId);

    let finalSec = durationSeconds || 0;
    if (durationSeconds === undefined && session) {
      const wallSec = Math.round((endedAt - session.started_at) / 1000);
      finalSec = Math.min(Math.max(0, wallSec), session.planned_min * 60);
    }

    await db.focus_sessions.update(sessionId, {
      ended_at: endedAt,
      duration_seconds: finalSec,
      completed_at: completed ? endedAt : null,
      completed: completed ? 1 : 0,
      ...(interruptNote ? { interrupt_note: interruptNote } : {}),
      ...(interruptTag ? { interrupt_tag: interruptTag } : {}),
      updated_at: now,
    });
  }

  // ---------- Habits ----------

  async habits(): Promise<HabitWithLogs[]> {
    const habitRows = await db.habits
      .filter((h) => h.deleted_at === null)
      .sortBy('sort');

    const logRows = await db.habit_logs
      .filter((l) => l.deleted_at === null)
      .toArray();

    const logsMap: Record<string, Record<string, string>> = {};
    for (const log of logRows) {
      if (!logsMap[log.habit_id]) logsMap[log.habit_id] = {};
      logsMap[log.habit_id][log.day_key] = log.status;
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
    badCost = '',
    replacement = '',
    reminderMinutes = null,
    frequency = 'daily',
  }: {
    title: string;
    cue: string;
    isBad: boolean;
    badCost?: string;
    replacement?: string;
    reminderMinutes?: number | null;
    frequency?: string;
  }): Promise<HabitRecord> {
    const now = Date.now();
    const habits = await db.habits.filter((h) => h.deleted_at === null).toArray();
    const maxSort = habits.reduce((max, h) => Math.max(max, h.sort || 0), -1);

    const habit: HabitRecord = {
      id: uuidv4(),
      title: title.trim(),
      cue: cue.trim(),
      created: todayKey(),
      frequency,
      recovery_count: 0,
      is_bad: isBad ? 1 : 0,
      bad_cost: badCost.trim(),
      replacement: replacement.trim(),
      reminder_minutes: reminderMinutes,
      sort: maxSort + 1,
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
    badCost = '',
    replacement = '',
    reminderMinutes = null,
    frequency = 'daily',
  }: {
    id: string;
    title: string;
    cue: string;
    isBad: boolean;
    badCost?: string;
    replacement?: string;
    reminderMinutes?: number | null;
    frequency?: string;
  }): Promise<void> {
    const now = Date.now();
    await db.habits.update(id, {
      title: title.trim(),
      cue: cue.trim(),
      frequency,
      is_bad: isBad ? 1 : 0,
      bad_cost: badCost.trim(),
      replacement: replacement.trim(),
      reminder_minutes: reminderMinutes,
      updated_at: now,
    });
  }

  async saveHabit({
    id,
    title,
    cue,
    isBad,
    badCost = '',
    replacement = '',
    reminderMinutes = null,
    frequency = 'daily',
  }: {
    id?: string | null;
    title: string;
    cue: string;
    isBad: boolean;
    badCost?: string;
    replacement?: string;
    reminderMinutes?: number | null;
    frequency?: string;
  }): Promise<void> {
    if (id) {
      await this.updateHabit({
        id,
        title,
        cue,
        isBad,
        badCost,
        replacement,
        reminderMinutes,
        frequency,
      });
    } else {
      await this.addHabit({
        title,
        cue,
        isBad,
        badCost,
        replacement,
        reminderMinutes,
        frequency,
      });
    }
  }

  async deleteHabit(id: string): Promise<void> {
    const now = Date.now();
    await db.transaction('rw', [db.habits, db.habit_logs], async () => {
      await db.habits.update(id, {
        deleted_at: now,
        updated_at: now,
      });

      const logs = await db.habit_logs.where('habit_id').equals(id).toArray();
      for (const log of logs) {
        await db.habit_logs.update(log.id, {
          deleted_at: now,
          updated_at: now,
        });
      }
    });
  }

  async logHabit(habitId: string, dayKey: string, status: 'done' | 'slip' | 'resisted' | null): Promise<void> {
    const now = Date.now();
    const logId = `${habitId}#${dayKey}`;

    if (status === null) {
      const existing = await db.habit_logs.get(logId);
      if (existing) {
        await db.habit_logs.update(logId, {
          deleted_at: now,
          updated_at: now,
        });
      }
    } else {
      await db.habit_logs.put({
        id: logId,
        habit_id: habitId,
        day_key: dayKey,
        status,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }
  }

  // ---------- Leisure / Fun Block ----------

  async funConfig(): Promise<FunConfig | null> {
    const rows = await db.leisure
      .filter((l) => l.deleted_at === null)
      .reverse()
      .sortBy('updated_at');

    if (rows.length > 0) {
      return {
        title: rows[0].title,
        minutes: rows[0].duration_minutes || 30,
      };
    }

    const setting = await this.getSetting('fun');
    if (setting) {
      try {
        return JSON.parse(setting);
      } catch {}
    }

    return null;
  }

  async setFunConfig(fun: FunConfig): Promise<void> {
    const now = Date.now();
    const existing = await db.leisure.filter((l) => l.deleted_at === null).first();

    if (existing) {
      await db.leisure.update(existing.id, {
        title: fun.title.trim(),
        duration_minutes: fun.minutes,
        updated_at: now,
      });
    } else {
      await db.leisure.add({
        id: uuidv4(),
        title: fun.title.trim(),
        duration_minutes: fun.minutes,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }

    await this.setSetting('fun', JSON.stringify(fun));
  }

  // ---------- Settings ----------

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

  // ---------- Energy Checks ----------

  async addEnergyCheck(level: number): Promise<void> {
    const now = Date.now();
    const currentHour = new Date().getHours();
    await db.energy_checks.add({
      id: uuidv4(),
      day_key: todayKey(),
      hour: currentHour,
      level,
      created_at: now,
      updated_at: now,
    });
  }

  // ---------- Stats (The Mirror) ----------

  async stats(): Promise<StatsData> {
    const today = todayKey();

    // 1. Closed days with prediction
    const closedDays = await db.days
      .filter((d) => d.closed_at !== null && d.prediction !== null && d.deleted_at === null)
      .reverse()
      .sortBy('day_key');

    const closedCount = closedDays.length;
    let winRate: number | null = null;
    let avgPrediction: number | null = null;
    let gap: number | null = null;

    if (closedCount > 0) {
      const wins = closedDays.filter((d) => d.outcome === 1).length;
      winRate = Math.round((wins / closedCount) * 100);
      const sumPred = closedDays.reduce((acc, d) => acc + (d.prediction || 0), 0);
      avgPrediction = Math.round(sumPred / closedCount);
      gap = avgPrediction - winRate;
    }

    const lastNights: NightRow[] = closedDays.slice(0, 7).map((d) => ({
      dayKey: d.day_key,
      prediction: d.prediction || 0,
      outcome: d.outcome === 1,
    }));

    // 2. Habit Recovery Rate (last 45 days)
    const allHabits = await this.habits();
    let misses = 0;
    let recoveries = 0;
    const positiveHabits = allHabits.filter((h) => h.is_bad === 0);

    for (const h of positiveHabits) {
      const startDay = h.created.localeCompare(shiftDayKey(today, -45)) > 0
        ? h.created
        : shiftDayKey(today, -45);
      
      let curr = startDay;
      while (curr.localeCompare(today) < 0) {
        if (h.logs[curr] !== 'done') {
          misses++;
          const nextDay = shiftDayKey(curr, 1);
          if (h.logs[nextDay] === 'done') {
            recoveries++;
          }
        }
        curr = shiftDayKey(curr, 1);
      }
    }

    const recoveryRate = misses > 0 ? Math.round((recoveries / misses) * 100) : null;

    // 3. Deep work minutes last 7 days
    const weekStart = shiftDayKey(today, -6);
    const sessions = await db.focus_sessions
      .where('day_key')
      .aboveOrEqual(weekStart)
      .filter((s) => s.ended_at !== null && s.kind === 'task')
      .toArray();

    const focusMinutesLast7 = [0, 0, 0, 0, 0, 0, 0];
    const todayDate = new Date(today);

    for (const s of sessions) {
      const sDate = new Date(s.day_key);
      const diffDays = Math.round((todayDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24));
      const idx = 6 - diffDays;
      if (idx >= 0 && idx <= 6) {
        let sec = s.duration_seconds || 0;
        if (sec <= 0 && s.started_at && s.ended_at) {
          const wallSec = Math.round((s.ended_at - s.started_at) / 1000);
          sec = Math.min(wallSec, (s.planned_min || 25) * 60);
        }
        focusMinutesLast7[idx] += Math.round(sec / 60);
      }
    }

    // 4. Interrupt patterns over last 30 days
    const thirtyDaysAgo = shiftDayKey(today, -30);
    const recentSessionRows = await db.focus_sessions
      .where('day_key')
      .aboveOrEqual(thirtyDaysAgo)
      .filter((s) => s.interrupt_tag !== null && s.interrupt_tag !== undefined)
      .toArray();

    const interruptCounts: Record<string, number> = {};
    for (const s of recentSessionRows) {
      if (s.interrupt_tag) {
        interruptCounts[s.interrupt_tag] = (interruptCounts[s.interrupt_tag] || 0) + 1;
      }
    }

    const recentInterruptsSessions = await db.focus_sessions
      .filter((s) => !!s.interrupt_note && s.interrupt_note.trim() !== '')
      .reverse()
      .sortBy('started_at');

    const recentInterrupts = recentInterruptsSessions
      .slice(0, 5)
      .map((s) => s.interrupt_note as string);

    // 5. Golden Hour
    const energyRows = await db.energy_checks
      .where('day_key')
      .aboveOrEqual(thirtyDaysAgo)
      .toArray();

    let goldenHour: number | null = null;
    if (energyRows.length >= 6) {
      const sums = new Array(8).fill(0);
      const counts = new Array(8).fill(0);

      for (const e of energyRows) {
        const bucket = Math.floor(e.hour / 3);
        if (bucket >= 0 && bucket < 8) {
          sums[bucket] += e.level;
          counts[bucket]++;
        }
      }

      let bestAvg = -1;
      for (let i = 0; i < 8; i++) {
        if (counts[i] > 0) {
          const avg = sums[i] / counts[i];
          if (avg > bestAvg) {
            bestAvg = avg;
            goldenHour = i * 3;
          }
        }
      }
    }

    // 6. Review Due check
    const lastReview = await this.getSetting('last_review');
    const reviewDue =
      (!lastReview && closedCount >= 6) ||
      (!!lastReview &&
        Math.round((new Date(today).getTime() - new Date(lastReview).getTime()) / (1000 * 3600 * 24)) >= 7);

    const focusMinutesWeek = focusMinutesLast7.reduce((sum, m) => sum + m, 0);

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

  // ---------- Backup & Restore ----------

  async exportJson(): Promise<string> {
    const tables = {
      tasks: await db.tasks.toArray(),
      days: await db.days.toArray(),
      habits: await db.habits.toArray(),
      habit_logs: await db.habit_logs.toArray(),
      leisure: await db.leisure.toArray(),
      focus_sessions: await db.focus_sessions.toArray(),
      thoughts: await db.thoughts.toArray(),
      energy_checks: await db.energy_checks.toArray(),
      settings: await db.settings.toArray(),
    };

    return JSON.stringify({
      app: 'taknoghte',
      version: 2,
      exportedAt: new Date().toISOString(),
      tables,
    }, null, 2);
  }

  async importJson(rawJson: string): Promise<void> {
    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error('Invalid JSON format');
    }

    if (!parsed || parsed.app !== 'taknoghte' || !parsed.tables) {
      throw new Error('Not a valid Taknoghte/Flow backup');
    }

    const { tables } = parsed;
    await db.transaction('rw', [
      db.tasks, db.days, db.habits, db.habit_logs, db.leisure,
      db.focus_sessions, db.thoughts, db.energy_checks, db.settings,
    ], async () => {
      if (tables.tasks) {
        await db.tasks.clear();
        await db.tasks.bulkPut(tables.tasks);
      }
      if (tables.days) {
        await db.days.clear();
        await db.days.bulkPut(tables.days);
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
      if (tables.focus_sessions) {
        await db.focus_sessions.clear();
        await db.focus_sessions.bulkPut(tables.focus_sessions);
      }
      if (tables.thoughts) {
        await db.thoughts.clear();
        await db.thoughts.bulkPut(tables.thoughts);
      }
      if (tables.energy_checks) {
        await db.energy_checks.clear();
        await db.energy_checks.bulkPut(tables.energy_checks);
      }
      if (tables.settings) {
        await db.settings.clear();
        await db.settings.bulkPut(tables.settings);
      }
    });
  }
}

export const repo = new Repo();
