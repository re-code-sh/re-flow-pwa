import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EditRounded,
  CloseRounded,
  ArrowCircleUpRounded,
} from '../ui/icons';
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
    appActions.showToast(
      lang === 'fa' ? 'فکر حذف شد' : 'Thought deleted',
      {
        actionLabel: t('undo'),
        onAction: async () => {
          await repo.restoreThought(th);
          loadData();
        },
      }
    );
  };

  const handlePromote = async (th: Thought) => {
    const onToday = await repo.promoteThought(th, todayKey());
    loadData();
    appActions.showToast(
      onToday
        ? (lang === 'fa' ? 'به برنامهٔ امروز اضافه شد' : 'Added to today\'s plan')
        : (lang === 'fa' ? 'در انتظارِ برنامهٔ فردا ذخیره شد' : 'Saved for tomorrow\'s plan')
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
      title={lang === 'fa' ? 'مخزنِ ذهن' : 'Brain Vault'}
      sub={
        lang === 'fa'
          ? 'تخلیهٔ بارِ شناختی در ۵ ثانیه — اینجا بگذار تا فراموش شود اما گم نشود.'
          : 'Dump cognitive load in 5s — leave it here so you can forget without losing.'
      }
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        {/* Instant Dump Field Matching Flutter _VaultSheet */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <GlassField
                hint={
                  editingId
                    ? (lang === 'fa' ? 'ویرایش فکر…' : 'Edit thought...')
                    : (lang === 'fa' ? 'ثبت سریع فکر…' : 'Quick dump thought...')
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onSubmitted={handleSubmit}
                autofocus
              />
            </div>
            <div className="w-20 shrink-0">
              <Pill
                label={editingId ? t('save') : (lang === 'fa' ? 'ثبت' : 'Dump')}
                style="ember"
                expanded
                onTap={handleSubmit}
              />
            </div>
          </div>

          {/* 3 Category Choice Chips Matching Flutter _categorySelector */}
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => {
              const isOn = category === c.cat;
              return (
                <button
                  key={c.cat}
                  type="button"
                  onClick={() => setCategory(c.cat)}
                  className={clsx(
                    'py-2 px-3 rounded-full text-[12px] font-bold border transition-all pressable text-center',
                    isOn
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                      : 'bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/70'
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Search if thoughts exist */}
        {thoughts.length > 3 && (
          <GlassField
            hint={lang === 'fa' ? 'جست‌وجو در افکار…' : 'Search thoughts...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        {/* Thought Cards List Matching Flutter _ThoughtCard */}
        <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-white/35 text-[13px]">
              {query ? t('noResultsFound') : (lang === 'fa' ? 'مخزن خالی است' : 'Vault is empty')}
            </div>
          ) : (
            filtered.map((th) => {
              const catLabel = categories.find((c) => c.cat === th.category)?.label || th.category;

              return (
                <GlassCard
                  key={th.id}
                  radius="small"
                  className="p-3.5 flex flex-col gap-2 hover:border-white/15 transition-all text-start"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10.5px] font-bold">
                      {catLabel}
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
                        <EditRounded style={{ fontSize: 16 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(th)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400"
                      >
                        <CloseRounded style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[14px] text-white/90 leading-relaxed break-words">{th.text}</p>

                  <button
                    type="button"
                    onClick={() => handlePromote(th)}
                    className="w-full py-1.5 rounded-xl bg-[var(--accent-soft)] hover:bg-[var(--accent)]/[0.2] border border-[var(--accent-border)] text-[var(--accent)] text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all pressable mt-1"
                  >
                    <ArrowCircleUpRounded style={{ fontSize: 16 }} />
                    <span>{lang === 'fa' ? 'ارتقا به کارِ امروز / فردا' : 'Promote to Task'}</span>
                  </button>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    </GlassSheet>
  );
};
