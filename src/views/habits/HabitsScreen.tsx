import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { repo } from '../../db/repo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Pill } from '../../components/ui/Pill';
import { CheckCircle } from '../../components/ui/CheckCircle';
import { GlassField } from '../../components/ui/GlassField';
import { toast } from '../../components/ui/Toast';
import { todayKey } from '../../utils/fa';
import { fireCelebrationConfetti } from '../../utils/confetti';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

export const HabitsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';
  const today = todayKey();

  const [title, setTitle] = useState('');
  const [cue, setCue] = useState('');

  const habits = useLiveQuery(() => repo.habits(), []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await repo.addHabit({
      title: title.trim(),
      cue: cue.trim() || (isFa ? 'بعد از قهوه صبح' : 'After morning coffee'),
      isBad: false,
    });
    setTitle('');
    setCue('');
    toast(isFa ? 'عادت جدید اضافه شد' : 'Habit added');
  };

  const handleToggle = async (habitId: string, isCurrentlyDone: boolean) => {
    await repo.logHabit(habitId, today, isCurrentlyDone ? null : 'done');
    if (!isCurrentlyDone) {
      fireCelebrationConfetti();
      toast(isFa ? 'عادت انجام شد ✓' : 'Habit completed ✓');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-6">
      <header className="space-y-1">
        <h1 className="text-[25px] font-extrabold text-ink">{t('habitsTab')}</h1>
        <p className="text-[12.5px] text-ink-3">{t('habitsSubtitle')}</p>
      </header>

      {/* Add Habit Form */}
      <GlassCard elevated className="p-4 space-y-3">
        <h3 className="text-[14.5px] font-bold text-ink">{t('newHabit')}</h3>
        <form onSubmit={handleAdd} className="space-y-2.5">
          <GlassField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            hint={t('habitTitleHint')}
          />
          <div className="flex gap-2">
            <GlassField
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              hint={t('cueHint')}
              className="flex-1"
            />
            <Pill
              label={t('addHabit')}
              pillStyle="accent"
              expanded={false}
              icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={() => handleAdd({ preventDefault: () => {} } as any)}
            />
          </div>
        </form>
      </GlassCard>

      {/* Habits List */}
      <div className="space-y-2.5">
        {(!habits || habits.length === 0) ? (
          <GlassCard className="text-center py-12 space-y-2">
            <RepeatRoundedIcon sx={{ fontSize: 36, color: 'var(--ink-3)' }} />
            <h3 className="text-[15px] font-bold text-ink-2">{t('emptyHabitsTitle')}</h3>
            <p className="text-[12.5px] text-ink-3">{t('emptyHabitsSubtitle')}</p>
          </GlassCard>
        ) : (
          habits.map((h) => {
            const isDone = h.logs[today] === 'done';

            return (
              <GlassCard key={h.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <CheckCircle checked={isDone} onToggle={() => handleToggle(h.id, isDone)} />
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-[15px] font-bold truncate ${isDone ? 'text-[var(--accent)]' : 'text-ink'}`}>
                      {h.title}
                    </h3>
                    {h.cue && (
                      <p className="text-[12px] text-ink-3 truncate mt-0.5">
                        {t('anchorCueLabel')}: {h.cue}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await repo.deleteHabit(h.id);
                    toast(isFa ? 'عادت حذف شد' : 'Habit deleted');
                  }}
                  className="pressable p-2 text-ink-3 hover:text-warn rounded-[10px]"
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                </button>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
};
