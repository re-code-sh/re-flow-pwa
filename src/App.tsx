import React, { useState, useEffect } from 'react';
import { db } from './db';
import { repo } from './db/repo';
import { todayKey } from './lib/fa';
import { AppLayout, type ActiveTab } from './components/layout/AppLayout';
import { TodayScreen } from './components/today/TodayScreen';
import { HabitsScreen } from './components/habits/HabitsScreen';
import { LeisureScreen } from './components/leisure/LeisureScreen';
import { FocusTimer, type FocusTimerConfig } from './components/FocusTimer';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('tasks');
  const [activeFocus, setActiveFocus] = useState<FocusTimerConfig | null>(null);

  // Seed sample initial data if database is brand new
  useEffect(() => {
    const seedInitialData = async () => {
      const tasksCount = await db.tasks.count();
      const habitsCount = await db.habits.count();
      const today = todayKey();

      if (tasksCount === 0) {
        const boulder = await repo.addTask(
          'تکمیل معماری اصلی و طراحی شیشهٔ مایع',
          'مهم‌ترین هدف امروز برای استقرار تجربه کاربری کامل',
          true,
          today
        );
        await repo.addTask('مرور عادت‌های روزانه و تنظیم اصطکاک', '', false, today);
        await repo.addTask('۴۵ دقیقه تفریح و بازی بدون عذاب وجدان', '', false, today);

        await repo.saveDayPlan({
          day_key: today,
          boulder_id: boulder.id,
          prediction: 85,
          planned: true,
          outcome: null,
          whys: [],
          note: '',
          closed_at: null,
          created_at: Date.now(),
          updated_at: Date.now(),
          deleted_at: null,
        });
      }

      if (habitsCount === 0) {
        await repo.addHabit(
          'نوشیدن آب و تنفس عمیق',
          'بلافاصله بعد از بیدار شدن از خواب',
          false
        );
        await repo.addHabit(
          'چک کردن شبکه‌های اجتماعی اول صبح',
          'هنگام بیدار شدن و قبل از شروع کار',
          true,
          'از دست دادن وضوح ذهنی و انرژی تمرکز برای ساعات اول روز',
          'گذاشتن گوشی در اتاق دیگر و نوشیدن یک لیوان آب خنک'
        );
      }

      const leisureCount = await db.leisure.count();
      if (leisureCount === 0) {
        await repo.saveLeisure('گیم / بازی و فیلم', 45);
      }
    };

    seedInitialData();
  }, []);

  return (
    <AppLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {/* 3 Domain Views */}
      {currentTab === 'tasks' && (
        <TodayScreen onStartFocus={(config) => setActiveFocus(config)} />
      )}

      {currentTab === 'habits' && <HabitsScreen />}

      {currentTab === 'leisure' && (
        <LeisureScreen onStartFocus={(config) => setActiveFocus(config)} />
      )}

      {/* Immersive 1:1 Focus Timer Arena */}
      <FocusTimer
        config={activeFocus}
        onClose={() => setActiveFocus(null)}
        onTaskCompleted={() => {}}
      />
    </AppLayout>
  );
};
