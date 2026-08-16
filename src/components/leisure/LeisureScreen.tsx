import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Settings2,
  Info,
  Check,
} from 'lucide-react';
import { repo } from '../../db/repo';
import { GlassCard } from '../ui/GlassCard';
import { Pill } from '../ui/Pill';
import { Reveal } from '../ui/Reveal';
import { Modal } from '../ui/Modal';
import { GlassField } from '../ui/GlassField';
import { useToast } from '../ui/Toast';
import { todayKey } from '../../lib/fa';
import { LeisureCard } from '../LeisureCard';
import type { FocusTimerConfig } from '../FocusTimer';

interface LeisureScreenProps {
  onStartFocus: (config: FocusTimerConfig) => void;
}

export const LeisureScreen: React.FC<LeisureScreenProps> = ({ onStartFocus }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

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
    <div className="space-y-5 pb-40">
      {/* 1. Header (Matching Flutter _Header) */}
      <Reveal order={0}>
        <div className="flex items-center justify-between px-1 pt-3 pb-2">
          <div className="space-y-1">
            <h1 className="text-[26px] font-extrabold text-ink tracking-tight">
              {t('app.leisureTab')}
            </h1>
            <p className="text-[12.5px] font-medium text-ink3 leading-relaxed">
              {t('leisure.leisureSubtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLeisureTitle(activeTitle);
              setLeisureMinutes(String(activeMinutes));
              setShowConfigModal(true);
            }}
            className="pressable flex h-[42px] w-[42px] items-center justify-center rounded-[14px] glass-surface text-ink2 hover:text-ink transition-colors"
            title={t('leisure.configFunTitle')}
          >
            <Settings2 className="w-[19px] h-[19px]" />
          </button>
        </div>
      </Reveal>

      {/* 2. Main Play Block Card (Direct 1:1 Transpiled LeisureCard) */}
      <Reveal order={1}>
        <LeisureCard
          title={activeTitle}
          minutes={activeMinutes}
          isBoulderDone={isBoulderDone}
          onStartPlay={handleStartPlay}
        />
      </Reveal>

      {/* 3. Philosophy Banner: Antidote to Parkinson's Law */}
      <Reveal order={2}>
        <GlassCard className="p-5 space-y-2 bg-white/[0.03]">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <Info className="w-4 h-4" />
            <h3 className="text-[13.5px] font-bold">
              {t('leisure.leisurePhilosophyTitle')}
            </h3>
          </div>
          <p className="text-[12.5px] text-ink2 leading-[1.8]">
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
