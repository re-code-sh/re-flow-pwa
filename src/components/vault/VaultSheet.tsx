import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Edit2,
  X,
  ArrowUpCircle,
} from 'lucide-react';
import { Thought, ThoughtCategory } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { GlassCard } from '../ui/GlassCard';
import { GlassSheet } from '../ui/GlassSheet';
import { clsx } from 'clsx';

export const VaultSheet: React.FC = () => {
  const { t } = useTranslation();
  const { isVaultSheetOpen, lang } = useAppStore();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState<ThoughtCategory>('idea');
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    const list = await repo.thoughts();
    setThoughts(list);
  };

  useEffect(() => {
    if (isVaultSheetOpen) {
      loadData();
    }
  }, [isVaultSheetOpen]);

  if (!isVaultSheetOpen) return null;

  const handleSubmit = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (editingId) {
      await repo.updateThought(editingId, trimmed, category);
      setEditingId(null);
    } else {
      await repo.addThought(trimmed, category);
    }

    setInputText('');
    loadData();
    appActions.showToast(
      lang === 'fa' ? 'فکر ثبت شد' : 'Thought recorded'
    );
  };

  const handleDelete = async (th: Thought) => {
    await repo.deleteThought(th.id);
    loadData();
    appActions.showToast(lang === 'fa' ? 'حذف شد' : 'Deleted', {
      actionLabel: t('undo'),
      onAction: async () => {
        await repo.restoreThought(th);
        loadData();
      },
    });
  };

  const handlePromote = async (th: Thought) => {
    const onToday = await repo.promoteThought(th, todayKey());
    loadData();
    appActions.showToast(
      onToday
        ? (lang === 'fa' ? 'به کارهای امروز اضافه شد' : "Added to today's tasks")
        : (lang === 'fa' ? 'برای ویزارد فردا ذخیره شد' : "Saved for tomorrow's wizard")
    );
  };

  const categories: { cat: ThoughtCategory; label: string }[] = [
    { cat: 'idea', label: lang === 'fa' ? 'ایده' : 'Idea' },
    { cat: 'worry', label: lang === 'fa' ? 'نگرانی' : 'Worry' },
    { cat: 'side_task', label: lang === 'fa' ? 'کار فرعی' : 'Side Task' },
  ];

  const filtered = !query.trim()
    ? thoughts
    : thoughts.filter((t) =>
        t.text.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <GlassSheet
      isOpen={isVaultSheetOpen}
      onClose={() => appActions.closeVaultSheet()}
      title={t('brainVaultTitle')}
      sub={t('brainVaultSub')}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-3">
        {/* Fast Dump Input Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <GlassField
              hint={
                editingId
                  ? (lang === 'fa' ? 'ویرایش فکر…' : 'Edit thought...')
                  : t('thoughtHint')
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onSubmitted={handleSubmit}
              autofocus
            />
          </div>
          <div className="shrink-0 w-20">
            <Pill
              label={
                editingId
                  ? t('save')
                  : (lang === 'fa' ? 'ثبت' : 'Save')
              }
              style="ember"
              expanded={false}
              onTap={handleSubmit}
            />
          </div>
        </div>

        {/* Category Selector Chips (Matching Flutter _catChip) */}
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => {
            const isOn = category === c.cat;
            return (
              <button
                key={c.cat}
                type="button"
                onClick={() => setCategory(c.cat)}
                className={clsx(
                  'py-2 rounded-xl text-[11.5px] font-semibold border transition-all duration-200 pressable',
                  isOn
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                    : 'bg-transparent text-white/38 border-white/[0.085]'
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <GlassField
          hint={t('searchHint')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* List of Thoughts */}
        <div className="flex flex-col gap-2.5 pt-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-white/38 text-[13px]">
              {query
                ? t('noResultsFound')
                : (lang === 'fa' ? 'هنوز فکری ثبت نشده.' : 'No thoughts recorded yet.')}
            </div>
          ) : (
            filtered.map((th) => (
              <GlassCard
                key={th.id}
                radius="small"
                className="p-3.5 md:p-4 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] text-[10px] font-medium text-white/55">
                    {categories.find((c) => c.cat === th.category)?.label || th.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(th.id);
                        setInputText(th.text);
                        setCategory(th.category);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/38 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(th)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/38 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[14px] text-[#F5F5F7] leading-relaxed">
                  {th.text}
                </p>

                {/* Promote to Task Action */}
                <button
                  type="button"
                  onClick={() => handlePromote(th)}
                  className="w-full py-2 rounded-[11px] bg-[var(--accent)]/[0.05] hover:bg-[var(--accent)]/[0.12] border border-[var(--accent)]/[0.10] text-[var(--accent)]/80 hover:text-[var(--accent)] text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all pressable"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'fa' ? 'ارتقا به کار' : 'Promote to Task'}
                  </span>
                </button>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </GlassSheet>
  );
};
