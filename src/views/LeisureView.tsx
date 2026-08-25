import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { repo } from '../db/repo';
import { GlassCard } from '../components/ui/GlassCard';
import { Pill } from '../components/ui/Pill';
import { GlassSheet } from '../components/ui/GlassSheet';
import { toast } from '../components/ui/Toast';
import { FocusTimer } from '../components/FocusTimer';
import { faNum, todayKey } from '../utils/fa';
import { ProductCardDetailTransition } from '../components/ProductCardDetailTransition';
import type { FunConfig } from '../db/schema';

// Material Icons
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

export const LeisureView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';
  const today = todayKey();

  const [funConfig, setFunConfig] = useState<FunConfig>({
    title: isFa ? 'تفریح بدون عذاب وجدان' : 'Guilt-Free Play',
    minutes: 30,
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMinutes, setEditMinutes] = useState(30);

  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [showBoulderPrompt, setShowBoulderPrompt] = useState(false);

  const plan = useLiveQuery(() => repo.dayPlan(today), [today]);

  useEffect(() => {
    repo.funConfig().then((cfg) => {
      if (cfg) {
        setFunConfig(cfg);
      }
    });
  }, []);

  const openEditor = () => {
    setEditTitle(funConfig.title);
    setEditMinutes(funConfig.minutes);
    setIsEditorOpen(true);
  };

  const handleSaveEditor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const titleTrimmed = editTitle.trim();
    if (!titleTrimmed) {
      toast(isFa ? 'عنوان تفریح را بنویسید' : 'Please enter the activity title');
      return;
    }

    const clampedMin = Math.min(240, Math.max(5, editMinutes));
    const newCfg: FunConfig = {
      title: titleTrimmed,
      minutes: clampedMin,
    };
    await repo.setFunConfig(newCfg);
    setFunConfig(newCfg);
    setIsEditorOpen(false);
    toast(isFa ? 'تنظیمات تفریح ذخیره شد' : 'Leisure config saved');
  };

  const handleStartPlay = () => {
    const locked = (plan?.planned ?? false) && !(plan?.boulderDone ?? false);
    if (locked) {
      setShowBoulderPrompt(true);
    } else {
      setIsFocusTimerOpen(true);
    }
  };

  const locked = (plan?.planned ?? false) && !(plan?.boulderDone ?? false);
  const durationLabel = isFa
    ? `${faNum(funConfig.minutes)} دقیقه`
    : `${funConfig.minutes} min`;

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Top Header */}
      <header className="space-y-1">
        <h1 className="text-[25px] font-extrabold text-ink">{t('leisureTab')}</h1>
        <p className="text-[12.5px] text-ink-3">{t('leisureSubtitle')}</p>
      </header>

      {/* Main Leisure Hero Card */}
      <GlassCard elevated className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] shrink-0">
              <SpaRoundedIcon sx={{ fontSize: 26 }} />
            </div>

            <div className="space-y-1">
              <h2 className="text-[18.5px] font-bold text-ink leading-tight">
                {funConfig.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-2">
                  <TimerOutlinedIcon sx={{ fontSize: 15, color: 'var(--ink-3)' }} />
                  <span>{durationLabel}</span>
                </span>

                {locked && (
                  <span className="px-2 py-0.5 rounded-[8px] bg-warn/10 border border-warn/25 text-[11px] font-bold text-warn">
                    {isFa ? 'قبل از تخته‌سنگ' : 'Before Boulder'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openEditor}
            className="p-2 rounded-full hover:bg-white/10 text-ink-3 hover:text-ink transition-all"
            title={t('edit')}
          >
            <EditOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Start Play Action Button */}
        <Pill
          label={t('startLeisurePlay')}
          pillStyle="accent"
          icon={<PlayArrowRoundedIcon sx={{ fontSize: 22 }} />}
          onClick={handleStartPlay}
        />
      </GlassCard>

      {/* Philosophy Card */}
      <GlassCard className="p-5 space-y-2 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <LightbulbOutlinedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
          <h3 className="text-[15px] font-bold text-ink">{t('leisurePhilosophyTitle')}</h3>
        </div>
        <p className="text-[13px] text-ink-2 leading-relaxed">
          {t('leisurePhilosophyBody')}
        </p>
      </GlassCard>

      {/* View Transition Product Catalog Showcase */}
      <div className="pt-4 border-t border-line/40">
        <ProductCardDetailTransition />
      </div>

      {/* ================= MODAL 1: CONFIGURE LEISURE ================= */}
      <GlassSheet
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={t('configFunTitle')}
        sub={t('configFunSub')}
      >
        <form onSubmit={handleSaveEditor} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-ink-2 px-1">
              {t('configFunPrompt')}
            </label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={t('configFunHint')}
              className="glass-input h-[48px] px-4 rounded-[16px] text-[14px] text-ink w-full placeholder:text-ink-3"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[12px] font-semibold text-ink-2">
                {t('durationMinutes')}
              </label>
              <span className="text-[13px] font-bold text-[var(--accent)]">
                {isFa ? `${faNum(editMinutes)} دقیقه` : `${editMinutes} mins`}
              </span>
            </div>

            {/* Quick Duration Chips */}
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setEditMinutes(mins)}
                  className={`pressable py-1.5 rounded-[12px] text-[12px] font-bold border transition-all ${
                    editMinutes === mins
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent-border)]'
                      : 'bg-white/[0.03] text-ink-3 border-line hover:text-ink'
                  }`}
                >
                  {isFa ? `${faNum(mins)} د` : `${mins}m`}
                </button>
              ))}
            </div>

            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={editMinutes}
              onChange={(e) => setEditMinutes(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer h-1.5 bg-white/10 rounded-lg mt-2"
            />
          </div>

          <div className="pt-2">
            <Pill
              label={t('save')}
              pillStyle="accent"
              onClick={handleSaveEditor}
            />
          </div>
        </form>
      </GlassSheet>

      {/* ================= MODAL 2: BOULDER LOCK PROMPT ================= */}
      {showBoulderPrompt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md glass-sheet rounded-[28px] p-6 space-y-4 shadow-2xl border border-line animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1.5">
              <h3 className="text-[18px] font-bold text-ink">
                {isFa ? 'اول تخته‌سنگ؟' : 'Boulder first?'}
              </h3>
              <p className="text-[13px] text-ink-3 leading-relaxed">
                {isFa
                  ? 'تفریح بعد از افتادنِ تخته‌سنگ، واقعاً بی‌گناه می‌شود. الان مطمئنی؟'
                  : 'Play after the Boulder is truly guilt-free. Are you sure right now?'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBoulderPrompt(false)}
                className="pressable flex-1 h-[48px] rounded-[16px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-[13.5px]"
              >
                {isFa ? 'صبر می‌کنم' : "I'll wait"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowBoulderPrompt(false);
                  setIsFocusTimerOpen(true);
                }}
                className="pressable flex-1 h-[48px] rounded-[16px] bg-white/[0.05] border border-line text-ink-3 font-semibold text-[13px] hover:text-ink"
              >
                {isFa ? 'به‌هرحال شروع کن' : 'Start anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Timer Modal for Leisure Session */}
      {isFocusTimerOpen && (
        <FocusTimer
          isOpen={true}
          onClose={() => setIsFocusTimerOpen(false)}
          taskId={null}
          taskTitle={funConfig.title}
          kind="fun"
          initialMinutes={funConfig.minutes}
        />
      )}
    </div>
  );
};
