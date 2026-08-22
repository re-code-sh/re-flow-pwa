import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckRounded, AddRounded } from '../ui/icons';
import { DayPlan } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey, fmtNum } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { GlassCard } from '../ui/GlassCard';
import { GlassSheet } from '../ui/GlassSheet';
import { CheckCircle } from '../ui/CheckCircle';
import { clsx } from 'clsx';

interface EveningModalProps {
  onRefresh: () => void;
}

export const EveningModal: React.FC<EveningModalProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { isEveningModalOpen, lang } = useAppStore();
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [whys, setWhys] = useState<string[]>(['', '', '']);
  const [whyVisible, setWhyVisible] = useState(1);
  const [nightNote, setNightNote] = useState('');

  const loadData = async () => {
    const p = await repo.dayPlan(todayKey());
    setPlan(p);
    if (p.whys && p.whys.length > 0) {
      setWhys([p.whys[0] || '', p.whys[1] || '', p.whys[2] || '']);
      setWhyVisible(Math.max(p.whys.length, 1));
    }
    setNightNote(p.note || '');
  };

  useEffect(() => {
    if (isEveningModalOpen) {
      loadData();
    }
  }, [isEveningModalOpen]);

  if (!isEveningModalOpen || !plan) return null;

  const handleToggleDone = async (taskId: string, currentDone: boolean) => {
    await repo.setTaskDone(todayKey(), taskId, !currentDone);
    const updated = await repo.dayPlan(todayKey());
    setPlan(updated);
    onRefresh();
  };

  const handleCloseDay = async () => {
    const validWhys = whys.slice(0, whyVisible).map((w) => w.trim()).filter(Boolean);
    if (!plan.boulderDone && validWhys.length === 0) {
      appActions.showToast(
        lang === 'fa'
          ? 'حداقل یک «چرا» — همین‌جا یادگیری اتفاق می‌افتد'
          : 'At least one "why" — this is where learning happens'
      );
      return;
    }

    await repo.closeDay({
      dayKey: todayKey(),
      whys: validWhys,
      note: nightNote.trim(),
    });
    appActions.showToast(
      plan.boulderDone
        ? (lang === 'fa' ? 'ثبت شد. روزِ برنده.' : 'Recorded. A winning day.')
        : (lang === 'fa' ? 'ثبت شد. فردا با سیستمِ اصلاح‌شده.' : 'Recorded. Tomorrow with improved system.')
    );
    appActions.closeEveningModal();
    onRefresh();
  };

  return (
    <GlassSheet
      isOpen={isEveningModalOpen}
      onClose={() => appActions.closeEveningModal()}
      title={lang === 'fa' ? 'پایان روز' : 'Evening Review'}
      sub={
        lang === 'fa'
          ? '۶۰ ثانیه — چک، چرا، یک خط'
          : '60 seconds — check, why, one line'
      }
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        {/* Final Check Section */}
        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-semibold text-white/70">
            {lang === 'fa' ? 'چک نهایی وظایف امروز:' : 'Final Task Check:'}
          </span>

          <div className="flex flex-col gap-2">
            {plan.tasks.map((task) => {
              const isBoulder = plan.boulderId === task.taskId;
              return (
                <GlassCard
                  key={task.taskId}
                  radius="small"
                  className="p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle
                      on={task.done}
                      onTap={() => handleToggleDone(task.taskId, task.done)}
                    />
                    <span
                      className={clsx(
                        'text-[14px] font-medium',
                        task.done ? 'line-through text-white/40' : 'text-white'
                      )}
                    >
                      {task.title}
                    </span>
                  </div>

                  {isBoulder && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10.5px] font-bold">
                      {lang === 'fa' ? 'تخته‌سنگ' : 'Boulder'}
                    </span>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Why-Chain if boulder not done, or celebration banner if boulder fell */}
        <div className="p-3.5 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center gap-2.5 text-[12.5px] text-[var(--accent)] font-semibold">
          <CheckRounded style={{ fontSize: 18 }} />
          <span>
            {plan.boulderDone
              ? (lang === 'fa' ? 'تخته‌سنگ افتاد' : 'Boulder Completed')
              : (lang === 'fa' ? 'تخته‌سنگ هنوز نیفتاده' : 'Boulder Incomplete')}
          </span>
        </div>

        {/* 3-Level Why-Chain */}
        {!plan.boulderDone && (
          <div className="flex flex-col gap-2.5 pt-1">
            <span className="text-[12.5px] font-semibold text-white/70">
              {lang === 'fa' ? 'زنجیرهٔ ۳ چراییِ ریشه‌ای:' : '3-Level Root Why Chain:'}
            </span>
            {Array.from({ length: whyVisible }).map((_, idx) => (
              <GlassField
                key={idx}
                hint={
                  idx === 0
                    ? (lang === 'fa' ? 'چرا نیفتاد؟ (علت سطحی)' : 'Why not? (Surface)')
                    : idx === 1
                    ? (lang === 'fa' ? 'و چرا آن اتفاق افتاد؟ (مانع واقعی)' : 'And why did that happen? (Real barrier)')
                    : (lang === 'fa' ? 'ریشهٔ اصلی چیست؟ (الگوی تکراری)' : 'What is the root cause? (Pattern)')
                }
                value={whys[idx]}
                onChange={(e) => {
                  const next = [...whys];
                  next[idx] = e.target.value;
                  setWhys(next);
                }}
              />
            ))}

            {whyVisible < 3 && (
              <button
                type="button"
                onClick={() => setWhyVisible((v) => Math.min(3, v + 1))}
                className="self-start text-[11.5px] text-[var(--accent)] font-bold flex items-center gap-1 hover:underline pt-0.5"
              >
                <AddRounded style={{ fontSize: 16 }} />
                <span>{lang === 'fa' ? 'یک لایه عمیق‌تر (چرا؟)' : 'One layer deeper (Why?)'}</span>
              </button>
            )}
          </div>
        )}

        {/* Night One-line Note */}
        <div className="flex flex-col gap-1.5 pt-1">
          <GlassField
            label={lang === 'fa' ? 'یادداشت یک‌خطی شب' : 'One-line Night Note'}
            hint={lang === 'fa' ? 'یک جمله دربارهٔ امروز…' : 'One sentence about today...'}
            value={nightNote}
            onChange={(e) => setNightNote(e.target.value)}
          />
        </div>

        {/* Close Day CTA */}
        <div className="pt-2">
          <Pill
            label={lang === 'fa' ? 'تثبیت و بستن روز' : 'Lock & Close Day'}
            style="ember"
            onTap={handleCloseDay}
          />
        </div>
      </div>
    </GlassSheet>
  );
};
