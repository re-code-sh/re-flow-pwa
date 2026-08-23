import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { repo } from '../../db/repo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Pill } from '../../components/ui/Pill';
import { GlassField } from '../../components/ui/GlassField';
import { toast } from '../../components/ui/Toast';
import { FocusScreenModal } from '../focus/FocusScreenModal';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

export const LeisureScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [isFocusing, setIsFocusing] = useState(false);

  useEffect(() => {
    repo.funConfig().then((cfg) => {
      if (cfg) {
        setTitle(cfg.title);
        setMinutes(cfg.minutes);
      } else {
        setTitle(isFa ? 'تفریح بدون عذاب وجدان' : 'Guilt-Free Play');
        setMinutes(30);
      }
    });
  }, [isFa]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    await repo.setFunConfig({ title: title.trim(), minutes });
    toast(isFa ? 'تنظیمات تفریح ذخیره شد' : 'Leisure config saved');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-6">
      <header className="space-y-1">
        <h1 className="text-[25px] font-extrabold text-ink">{t('leisureTab')}</h1>
        <p className="text-[12.5px] text-ink-3">{t('leisureSubtitle')}</p>
      </header>

      {/* Guilt Free Play Card */}
      <GlassCard elevated className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <SpaRoundedIcon sx={{ fontSize: 22, color: 'var(--accent)' }} />
          <h3 className="text-[16px] font-bold text-ink">{t('configFunTitle')}</h3>
        </div>

        <GlassField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          label={t('configFunPrompt')}
          hint={t('configFunHint')}
        />

        <div className="space-y-1.5">
          <label className="text-[11.5px] font-semibold text-ink-3 px-1">
            {t('durationMinutes')}: {minutes}
          </label>
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer h-1.5 bg-white/10 rounded-lg"
          />
        </div>

        <div className="flex gap-2.5 pt-2">
          <Pill
            label={t('save')}
            pillStyle="quiet"
            onClick={handleSave}
            className="flex-1"
          />
          <Pill
            label={t('startLeisurePlay')}
            pillStyle="accent"
            icon={<PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
            onClick={() => setIsFocusing(true)}
            className="flex-2"
          />
        </div>
      </GlassCard>

      {/* Philosophy Card */}
      <GlassCard className="p-5 space-y-2 bg-white/[0.02]">
        <h4 className="text-[14px] font-bold text-ink-2 flex items-center gap-2">
          <span>🧠</span>
          <span>{t('leisurePhilosophyTitle')}</span>
        </h4>
        <p className="text-[12.5px] text-ink-3 leading-relaxed">
          {t('leisurePhilosophyBody')}
        </p>
      </GlassCard>

      {isFocusing && (
        <FocusScreenModal
          isOpen={true}
          onClose={() => setIsFocusing(false)}
          taskId={null}
          taskTitle={title}
          plannedMinutes={minutes}
        />
      )}
    </div>
  );
};
