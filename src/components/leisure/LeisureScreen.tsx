import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Lock,
  Unlock,
  Play,
  Settings2,
  Info,
  Clock,
  Check,
} from 'lucide-react';
import { repo } from '../../db/repo';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { Reveal } from '../ui/Reveal';
import { Modal } from '../ui/Modal';
import { GlassField } from '../ui/GlassField';
import { useToast } from '../ui/Toast';
import { todayKey, faNum } from '../../lib/fa';
import type { ActiveFocusSessionConfig } from '../focus/FocusArena';

interface LeisureScreenProps {
  onStartFocus: (config: ActiveFocusSessionConfig) => void;
}

export const LeisureScreen: React.FC<LeisureScreenProps> = ({ onStartFocus }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const today = todayKey();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [leisureTitle, setLeisureTitle] = useState('گیم / بازی و فیلم');
  const [leisureMinutes, setLeisureMinutes] = useState('45');

  // Queries
  const dayTasks = useLiveQuery(() => repo.getTasksForDay(today), [today]);
  const leisureItems = useLiveQuery(() => repo.getLeisure(), []);

  const boulderTask = (dayTasks || []).find((t) => t.is_boulder);
  const isBoulderDone = boulderTask ? boulderTask.status === 'completed' : false;

  const currentLeisure = leisureItems && leisureItems.length > 0 ? leisureItems[0] : null;
  const activeTitle = currentLeisure?.title || leisureTitle;
  const activeMinutes = currentLeisure?.duration_minutes || parseInt(leisureMinutes, 10) || 45;

  const handleSaveConfig = async () => {
    const title = leisureTitle.trim() || 'تفریح بدون عذاب وجدان';
    const mins = parseInt(leisureMinutes, 10) || 45;

    try {
      await repo.saveLeisure(title, mins);
      showToast(t('common.save') + ' ✓');
      setShowConfigModal(false);
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  const handleStartPlay = () => {
    onStartFocus({
      taskId: null,
      title: activeTitle,
      minutes: activeMinutes,
      kind: 'fun',
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <Reveal order={0}>
        <div className="flex items-center justify-between pt-2 pb-1">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-ink3 tracking-wide">
              {t('leisure.leisureSubtitle')}
            </span>
            <h1 className="text-2xl font-black tracking-tight text-ink mt-0.5">
              {t('app.leisureTab')}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setLeisureTitle(activeTitle);
              setLeisureMinutes(String(activeMinutes));
              setShowConfigModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-surface text-xs font-semibold text-ink2 hover:text-ink active:scale-95 transition-all"
          >
            <Settings2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>{t('leisure.configFunTitle')}</span>
          </button>
        </div>
      </Reveal>

      {/* Main Play Block Card */}
      <Reveal order={1}>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink3 px-1 block">
            {t('leisure.guiltFreePlayBlock')}
          </span>

          <GlassCard
            emberRing={isBoulderDone}
            radius="card"
            className="p-6 relative overflow-hidden"
          >
            {/* Soft Ambient Glow */}
            <div
              className={`absolute -top-10 -left-10 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
                isBoulderDone ? 'opacity-25' : 'opacity-10'
              }`}
              style={{ backgroundColor: 'var(--color-accent)' }}
            />

            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isBoulderDone
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 text-ink3 border-glass-line'
                  }`}
                >
                  {isBoulderDone ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{t('leisure.funUnlockedSub')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t('leisure.funLockedSub')}</span>
                    </>
                  )}
                </span>

                <span className="text-xs font-mono font-bold text-ink3 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  {currentLang === 'fa' ? faNum(activeMinutes) : activeMinutes} {t('leisure.durationMinutes')}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-ink truncate">
                  {activeTitle}
                </h2>
                <p className="text-xs text-ink3 leading-relaxed">
                  {t('leisure.funHint')}
                </p>
              </div>

              <div className="pt-2">
                <Pill
                  pillStyle={isBoulderDone ? 'ember' : 'glass'}
                  onClick={handleStartPlay}
                  icon={<Play className="w-4 h-4 fill-current" />}
                  className="h-[52px] font-bold"
                >
                  {t('leisure.startLeisurePlay')}
                </Pill>
              </div>
            </div>
          </GlassCard>
        </div>
      </Reveal>

      {/* Philosophy Banner: Antidote to Parkinson's Law */}
      <Reveal order={2}>
        <GlassCard className="p-5 bg-white/[0.03] border-glass-line space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-accent)]">
            <Info className="w-4 h-4" />
            <h3 className="text-sm font-bold">{t('leisure.leisurePhilosophyTitle')}</h3>
          </div>
          <p className="text-xs text-ink2 leading-relaxed">
            {t('leisure.leisurePhilosophyBody')}
          </p>
        </GlassCard>
      </Reveal>

      {/* Configure Leisure Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={t('leisure.configFunTitle')}
        subtitle={t('leisure.configFunHint')}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <GlassField
            label={t('leisure.configFunPrompt')}
            hint={t('leisure.configFunHint')}
            value={leisureTitle}
            onChange={setLeisureTitle}
          />

          <GlassField
            label={t('leisure.durationMinutes')}
            hint="45"
            value={leisureMinutes}
            onChange={setLeisureMinutes}
          />

          <Pill
            pillStyle="ember"
            onClick={handleSaveConfig}
            className="h-[48px]"
            icon={<Check className="w-4 h-4 stroke-[3]" />}
          >
            {t('common.save')}
          </Pill>
        </div>
      </Modal>
    </div>
  );
};
