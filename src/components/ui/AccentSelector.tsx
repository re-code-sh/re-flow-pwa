import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { clsx } from 'clsx';

export const AccentSelector: React.FC = () => {
  const { accent, setAccent, availableAccents } = useTheme();
  const { i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
      {availableAccents.map((item) => {
        const isSelected = accent === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setAccent(item.code as any)}
            className={clsx(
              'pressable flex flex-col items-center justify-center p-3 rounded-[18px] border transition-all duration-200',
              isSelected
                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-border)]'
                : 'border-line bg-glass-b hover:bg-glass-a'
            )}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shadow-md mb-2 relative"
              style={{ backgroundColor: item.color }}
            >
              {isSelected && (
                <CheckRoundedIcon sx={{ fontSize: 18, color: '#1C1207' }} />
              )}
            </div>
            <span
              className={clsx(
                'text-[12px] font-semibold truncate',
                isSelected ? 'text-[var(--accent)]' : 'text-ink-2'
              )}
            >
              {isFa ? item.nameFa : item.nameEn}
            </span>
          </button>
        );
      })}
    </div>
  );
};
