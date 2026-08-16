import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BatteryCharging } from 'lucide-react';
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
    <GlassCard radius="small" className="p-4 md:p-5 text-start">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-[13.5px] font-bold text-[#F5F5F7]">{t('energyRightNow')}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {levels.map((item) => {
          const isSelected = selectedLevel === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => handleSelect(item.level)}
              className={clsx(
                'py-2.5 px-2 rounded-xl text-[12.5px] font-semibold transition-all duration-200 cursor-pointer pressable border',
                isSelected
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] shadow-[0_0_12px_var(--accent-glow)]'
                  : 'bg-white/[0.04] text-white/60 border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
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
