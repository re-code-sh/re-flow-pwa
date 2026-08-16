import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BrainCircuit,
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowUpCircle,
  X,
} from 'lucide-react';
import { Thought, ThoughtCategory } from '../../core/types';
import { useAppStore, appActions } from '../../state/useAppStore';
import { repo } from '../../db/repo';
import { todayKey } from '../../core/jalali';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { GlassCard } from '../ui/GlassCard';
import { clsx } from 'clsx';

export const VaultSheet: React.FC = () => {
  const { t } = useTranslation();
  const { isVaultSheetOpen } = useAppStore();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState<ThoughtCategory>('idea');
  const [selectedFilter, setSelectedFilter] = useState<ThoughtCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
    appActions.showToast(t('toastThoughtSaved'));
  };

  const handleDelete = async (th: Thought) => {
    await repo.deleteThought(th.id);
    loadData();
    appActions.showToast(t('toastThoughtDeleted'), {
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
      onToday ? t('toastPromotedToToday') : t('toastSavedForTomorrow')
    );
  };

  const categories: { cat: ThoughtCategory; label: string }[] = [
    { cat: 'idea', label: t('filterIdea') },
    { cat: 'worry', label: t('filterWorry') },
    { cat: 'side_task', label: t('filterSideTask') },
  ];

  const filtered = thoughts.filter((th) => {
    if (selectedFilter && th.category !== selectedFilter) return false;
    if (
      searchQuery &&
      !th.text.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#16161A] border border-white/[0.085] rounded-t-[32px] md:rounded-[32px] p-6 max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl flex flex-col gap-4 text-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-white/15 rounded-full mx-auto md:hidden -mt-2 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[20px] font-extrabold text-[#F5F5F7]">
              {t('brainVaultTitle')}
            </h3>
            <p className="text-[12.5px] text-white/55 mt-0.5">{t('brainVaultSub')}</p>
          </div>
          <button
            type="button"
            onClick={() => appActions.closeVaultSheet()}
            className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fast Dump Input */}
        <GlassCard radius="small" className="p-3.5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <GlassField
              hint={editingId ? 'ویرایش فکر…' : t('thoughtHint')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onSubmitted={handleSubmit}
              autofocus
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="h-[50px] px-5 rounded-[16px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-ink)] font-bold flex items-center justify-center pressable shrink-0 text-[14px]"
            >
              {editingId ? t('save') : t('confirm')}
            </button>
          </div>

          {/* Category Selector Chips */}
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => {
              const isOn = category === c.cat;
              return (
                <button
                  key={c.cat}
                  type="button"
                  onClick={() => setCategory(c.cat)}
                  className={clsx(
                    'py-2 rounded-xl text-[12px] font-bold border transition-all pressable',
                    isOn
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                      : 'bg-white/[0.03] text-white/45 border-white/[0.06]'
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Search & Filter Bar */}
        {thoughts.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            <GlassField
              hint={t('searchHint')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <button
                type="button"
                onClick={() => setSelectedFilter(null)}
                className={clsx(
                  'px-3 py-1.5 rounded-xl text-[12px] font-bold border shrink-0 transition-all',
                  selectedFilter === null
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                    : 'bg-white/[0.03] text-white/45 border-white/[0.06]'
                )}
              >
                {t('filterAll')}
              </button>
              {categories.map((c) => {
                const isSelected = selectedFilter === c.cat;
                return (
                  <button
                    key={c.cat}
                    type="button"
                    onClick={() => setSelectedFilter(c.cat)}
                    className={clsx(
                      'px-3 py-1.5 rounded-xl text-[12px] font-bold border shrink-0 transition-all',
                      isSelected
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                        : 'bg-white/[0.03] text-white/45 border-white/[0.06]'
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Thoughts List */}
        <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto scrollbar-none">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-white/40 text-[13px]">
              {searchQuery ? t('noResultsFound') : t('emptyVaultTitle')}
            </div>
          ) : (
            filtered.map((th) => (
              <GlassCard
                key={th.id}
                radius="small"
                className="p-3.5 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10.5px] font-semibold text-white/60">
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
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(th)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[14px] text-white/90 leading-relaxed">{th.text}</p>

                {/* Promote to Task action */}
                <button
                  type="button"
                  onClick={() => handlePromote(th)}
                  className="w-full py-2 rounded-xl bg-[var(--accent)]/[0.08] hover:bg-[var(--accent)]/[0.15] border border-[var(--accent-border)] text-[var(--accent)] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all pressable"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>{t('promoteToTaskAction')}</span>
                </button>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
