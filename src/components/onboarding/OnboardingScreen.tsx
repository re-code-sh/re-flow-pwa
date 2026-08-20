import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LocalFireDepartmentRounded,
  RestartAltRounded,
  NotificationsActiveRounded,
} from '../ui/icons';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { fmtTime, fmtNum } from '../../core/jalali';
import { Pill } from '../ui/Pill';
import { GlassCard } from '../ui/GlassCard';
import { TimePickerModal } from '../ui/TimePickerModal';
import { clsx } from 'clsx';

export const OnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useAppStore();
  const [page, setPage] = useState(0);
  const [morning, setMorning] = useState(8 * 60 + 30);
  const [evening, setEvening] = useState(21 * 60);
  const [activePicker, setActivePicker] = useState<'morning' | 'evening' | null>(null);

  const slides = [
    {
      visual: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 animate-breath-slow blur-xl" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] shadow-[0_0_35px_var(--accent-glow)] animate-pulse" />
        </div>
      ),
      title: t('onboardingSlide1Title'),
      body: t('onboardingSlide1Body'),
    },
    {
      visual: (
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center text-[var(--accent)] shadow-2xl">
          <LocalFireDepartmentRounded style={{ fontSize: 44 }} />
        </div>
      ),
      title: t('onboardingSlide2Title'),
      body: t('onboardingSlide2Body'),
    },
    {
      visual: (
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center text-[var(--accent)] shadow-2xl">
          <RestartAltRounded style={{ fontSize: 44 }} />
        </div>
      ),
      title: t('onboardingSlide3Title'),
      body: t('onboardingSlide3Body'),
    },
    {
      visual: (
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center text-[var(--accent)] shadow-2xl">
          <NotificationsActiveRounded style={{ fontSize: 44 }} />
        </div>
      ),
      title: t('onboardingSlide4Title'),
      body: t('onboardingSlide4Body'),
    },
  ];

  const handleFinish = () => {
    appActions.setOnboarded(true);
    repo.setReminderMinutes('rem_morning', morning).catch(() => {});
    repo.setReminderMinutes('rem_evening', evening).catch(() => {});
  };

  const handleNext = () => {
    if (page < slides.length - 1) {
      setPage((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const isLast = page === slides.length - 1;

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F7] flex flex-col justify-between p-6 max-w-md mx-auto z-20 select-none animate-fadeIn">
      {/* Top Skip button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleFinish}
          className="text-[13px] font-bold text-white/40 hover:text-white/80 transition-colors p-2"
        >
          {t('skipAction')}
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-6">
        <div className="mb-2">{slides[page].visual}</div>

        <h2 className="text-[26px] md:text-[28px] font-extrabold text-white leading-tight">
          {slides[page].title}
        </h2>

        <p className="text-[14.5px] text-white/60 leading-loose max-w-sm whitespace-pre-line">
          {slides[page].body}
        </p>

        {/* If last slide: Reminder Configuration Pickers */}
        {isLast && (
          <div className="w-full flex flex-col gap-2.5 pt-2">
            <GlassCard
              radius="small"
              className="p-3.5 flex items-center justify-between cursor-pointer"
              onTap={() => setActivePicker('morning')}
            >
              <span className="text-[13px] font-semibold text-white">
                {t('morningReminder')}
              </span>
              <span className="text-[13.5px] font-bold text-[var(--accent)] tabular-nums">
                {fmtTime(morning, lang)}
              </span>
            </GlassCard>

            <GlassCard
              radius="small"
              className="p-3.5 flex items-center justify-between cursor-pointer"
              onTap={() => setActivePicker('evening')}
            >
              <span className="text-[13px] font-semibold text-white">
                {t('eveningReminder')}
              </span>
              <span className="text-[13.5px] font-bold text-[var(--accent)] tabular-nums">
                {fmtTime(evening, lang)}
              </span>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Bottom Controls (Dots & Action Pill) */}
      <div className="flex flex-col gap-6 pb-4">
        {/* Progress Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={clsx(
                'h-1.5 rounded-full transition-all duration-300',
                i === page ? 'w-6 bg-[var(--accent)]' : 'w-1.5 bg-white/20'
              )}
            />
          ))}
        </div>

        <Pill
          label={isLast ? t('startFlowAction') : t('next')}
          style="ember"
          onTap={handleNext}
        />
      </div>

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={activePicker !== null}
        initialMinutes={activePicker === 'morning' ? morning : evening}
        title={
          activePicker === 'morning'
            ? t('morningReminder')
            : t('eveningReminder')
        }
        onClose={() => setActivePicker(null)}
        onConfirm={(m) => {
          if (activePicker === 'morning') setMorning(m);
          else setEvening(m);
        }}
      />
    </div>
  );
};
