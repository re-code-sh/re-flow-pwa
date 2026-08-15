import { v4 as uuidv4 } from 'uuid';
import { db } from './index';
import type {
  Task,
  DayPlan,
  Thought,
  FocusSession,
  Habit,
  HabitLog,
  Leisure,
  ThoughtCategoryType,
  HabitLogStatus,
} from './schema';
import { todayKey } from '../lib/fa';

export const repo = {
  // ---------- Tasks & Backlog ----------

  async getBacklog(): Promise<Task[]> {
    return db.tasks
      .filter((t) => t.scheduled_date === null && t.deleted_at === null && t.status === 'pending')
      .reverse()
      .sortBy('created_at');
  },

  async getTasksForDay(dayKey: string): Promise<Task[]> {
    return db.tasks
      .filter((t) => t.scheduled_date === dayKey && t.deleted_at === null)
      .sortBy('active_order');
  },

  async addTask(title: string, notes = '', isBoulder = false, scheduledDate: string | null = null): Promise<Task> {
    const now = Date.now();
    const task: Task = {
      id: uuidv4(),
      title: title.trim(),
      notes: notes.trim(),
      is_boulder: isBoulder,
      status: 'pending',
      scheduled_date: scheduledDate,
      reminder_time: null,
      active_order: 0,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.tasks.add(task);
    return task;
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<void> {
    const now = Date.now();
    await db.tasks.update(id, {
      ...updates,
      updated_at: now,
    });
  },

  async toggleTaskCompleted(id: string, completed: boolean): Promise<void> {
    const now = Date.now();
    await db.tasks.update(id, {
      status: completed ? 'completed' : 'pending',
      updated_at: now,
    });
  },

  async deleteTask(id: string): Promise<void> {
    const now = Date.now();
    await db.tasks.update(id, {
      deleted_at: now,
      updated_at: now,
    });
  },

  async setBoulder(dayKey: string, taskId: string): Promise<void> {
    const now = Date.now();
    const tasks = await this.getTasksForDay(dayKey);
    for (const t of tasks) {
      const isTarget = t.id === taskId;
      if (t.is_boulder !== isTarget) {
        await db.tasks.update(t.id, { is_boulder: isTarget, updated_at: now });
      }
    }
    const day = await this.getDayPlan(dayKey);
    await db.days.put({
      ...day,
      boulder_id: taskId,
      updated_at: now,
    });
  },

  // ---------- Day Plans ----------

  async getDayPlan(dayKey: string = todayKey()): Promise<DayPlan> {
    const existing = await db.days.get(dayKey);
    if (existing && !existing.deleted_at) {
      return existing;
    }
    const now = Date.now();
    const emptyPlan: DayPlan = {
      day_key: dayKey,
      planned: false,
      boulder_id: null,
      prediction: null,
      closed_at: null,
      outcome: null,
      whys: [],
      note: '',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    return emptyPlan;
  },

  async saveDayPlan(plan: DayPlan): Promise<void> {
    const now = Date.now();
    await db.days.put({
      ...plan,
      updated_at: now,
    });
  },

  async closeDay(dayKey: string, outcome: boolean, whys: string[] = [], note = ''): Promise<void> {
    const now = Date.now();
    const existing = await this.getDayPlan(dayKey);
    await db.days.put({
      ...existing,
      closed_at: now,
      outcome,
      whys,
      note,
      updated_at: now,
    });
  },

  // ---------- Brain Vault (Thoughts) ----------

  async getThoughts(category?: ThoughtCategoryType): Promise<Thought[]> {
    let collection = db.thoughts.filter((t) => t.deleted_at === null);
    if (category) {
      collection = collection.filter((t) => t.category === category);
    }
    return collection.reverse().sortBy('created_at');
  },

  async addThought(text: string, category: ThoughtCategoryType = 'idea'): Promise<Thought> {
    const now = Date.now();
    const thought: Thought = {
      id: uuidv4(),
      text: text.trim(),
      category,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.thoughts.add(thought);
    return thought;
  },

  async deleteThought(id: string): Promise<void> {
    const now = Date.now();
    await db.thoughts.update(id, {
      deleted_at: now,
      updated_at: now,
    });
  },

  async promoteThoughtToTask(thought: Thought, scheduledDate: string | null = todayKey()): Promise<Task> {
    const task = await this.addTask(thought.text, '', false, scheduledDate);
    await this.deleteThought(thought.id);
    return task;
  },

  // ---------- Habits ----------

  async getHabits(): Promise<Habit[]> {
    return db.habits
      .filter((h) => h.deleted_at === null)
      .sortBy('sort');
  },

  async addHabit(
    title: string,
    cue: string,
    isBad = false,
    badCost = '',
    replacement = '',
    reminderMinutes: number | null = null,
  ): Promise<Habit> {
    const now = Date.now();
    const habit: Habit = {
      id: uuidv4(),
      title: title.trim(),
      cue: cue.trim(),
      created: todayKey(),
      frequency: 'daily',
      recovery_count: 0,
      is_bad: isBad,
      bad_cost: badCost.trim(),
      replacement: replacement.trim(),
      reminder_minutes: reminderMinutes,
      sort: 0,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.habits.add(habit);
    return habit;
  },

  async logHabit(habitId: string, dayKey: string, status: HabitLogStatus): Promise<void> {
    const now = Date.now();
    const log: HabitLog = {
      habit_id: habitId,
      day_key: dayKey,
      status,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.habit_logs.put(log);
  },

  async getHabitLogsForDay(dayKey: string): Promise<Record<string, HabitLogStatus>> {
    const logs = await db.habit_logs.where('day_key').equals(dayKey).toArray();
    const result: Record<string, HabitLogStatus> = {};
    for (const log of logs) {
      if (!log.deleted_at) {
        result[log.habit_id] = log.status;
      }
    }
    return result;
  },

  // ---------- Focus Sessions ----------

  async getFocusSessions(dayKey?: string): Promise<FocusSession[]> {
    if (dayKey) {
      return db.focus_sessions
        .where('day_key')
        .equals(dayKey)
        .reverse()
        .sortBy('started_at');
    }
    return db.focus_sessions.reverse().sortBy('started_at');
  },

  async addFocusSession(session: Omit<FocusSession, 'id' | 'created_at' | 'updated_at'>): Promise<FocusSession> {
    const now = Date.now();
    const fullSession: FocusSession = {
      ...session,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };
    await db.focus_sessions.add(fullSession);
    return fullSession;
  },

  // ---------- Leisure (Guilt-Free Play) ----------

  async getLeisure(): Promise<Leisure[]> {
    return db.leisure.filter((l) => l.deleted_at === null).sortBy('created_at');
  },

  async saveLeisure(title: string, durationMinutes = 30): Promise<Leisure> {
    const now = Date.now();
    const leisure: Leisure = {
      id: uuidv4(),
      title: title.trim(),
      duration_minutes: durationMinutes,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    await db.leisure.add(leisure);
    return leisure;
  },

  // ---------- Settings & Sync Metadata ----------

  async getSetting(k: string): Promise<string | null> {
    const row = await db.settings.get(k);
    return row ? row.v : null;
  },

  async setSetting(k: string, v: string): Promise<void> {
    await db.settings.put({
      k,
      v,
      updated_at: Date.now(),
    });
  },

  async getSyncMeta(key: string): Promise<string | null> {
    const row = await db.sync_meta.get(key);
    return row ? row.value : null;
  },

  async setSyncMeta(key: string, value: string): Promise<void> {
    await db.sync_meta.put({ key, value });
  },
};
