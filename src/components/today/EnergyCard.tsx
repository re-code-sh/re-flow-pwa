import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { GlassCard } from '../ui/GlassCard';
import { clsx } from 'clsx';

export const EnergyCard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const levels = [
    { level: 1, label: t('energyLow') },
    { level: 2, label: t('energyMed') },
    { level: 3, label: t('energyHigh') },
  ];

  const handleSelect = async (lvl: number) => {
    setSelectedLevel(lvl);
    await repo.addEnergyCheck(lvl);
    appActions.showToast(t('energyLoggedToast'));
  };

  return (
    <GlassCard radius="small" className="px-3.5 py-2.5 flex items-center justify-between text-start">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-[var(--accent)] shrink-0" />
        <span className="text-[12.5px] font-semibold text-white/80 select-none">
          {t('energyRightNow')}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {levels.map((item) => {
          const isSelected = selectedLevel === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => handleSelect(item.level)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all duration-200 cursor-pointer pressable border',
                isSelected
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                  : 'bg-white/[0.04] text-white/60 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};
