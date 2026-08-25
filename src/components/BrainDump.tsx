import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { repo } from '../db/repo';
import { toast } from './ui/Toast';
import { todayKey } from '../utils/fa';
import type { ThoughtCategoryType, ThoughtRecord } from '../db/schema';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { ViewTransition } from './ui/ViewTransition';
import { clsx } from 'clsx';

interface BrainDumpProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { key: ThoughtCategoryType; labelFa: string; labelEn: string }[] = [
  { key: 'idea', labelFa: 'ایده', labelEn: 'Idea' },
  { key: 'worry', labelFa: 'نگرانی', labelEn: 'Worry' },
  { key: 'side_task', labelFa: 'کار فرعی', labelEn: 'Side Task' },
];

export const BrainDump: React.FC<BrainDumpProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [category, setCategory] = useState<ThoughtCategoryType>('idea');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const thoughts = useLiveQuery(() => repo.thoughts(), [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingId) {
      await repo.updateThought(editingId, trimmed, category);
      toast(isFa ? 'فکر ویرایش شد' : 'Thought updated');
      setEditingId(null);
    } else {
      await repo.addThought(trimmed, category);
      toast(isFa ? 'فکر ثبت شد' : 'Thought recorded');
    }
    setText('');
    inputRef.current?.focus();
  };

  const handlePromote = async (thought: ThoughtRecord) => {
    const onToday = await repo.promoteThought(thought, todayKey());
    toast(
      onToday
        ? (isFa ? 'به کارهای امروز اضافه شد' : "Added to today's tasks")
        : (isFa ? 'برای ویزارد فردا ذخیره شد' : "Saved for tomorrow's wizard")
    );
  };

  const filteredThoughts = (thoughts || []).filter((item) =>
    search.trim() ? item.text.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Sheet on Mobile / Command Palette on Desktop */}
      <ViewTransition name="brain-vault-sheet" share="morph" className="relative w-full max-w-lg z-10">
        <div className="w-full glass-sheet rounded-t-[32px] md:rounded-[28px] max-h-[88vh] flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom duration-300 overflow-hidden">
          {/* Grab Handle (Mobile) */}
          <div className="w-full flex md:hidden justify-center pt-3 pb-1">
            <div className="w-[38px] h-[5px] rounded-full bg-white/15" />
          </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <PsychologyOutlinedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-ink">{t('brainVaultTitle')}</h2>
              <p className="text-[11.5px] text-ink-3">{t('brainVaultSub')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-ink-3 hover:text-ink transition-all"
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Body Container */}
        <div className="overflow-y-auto px-6 py-3 space-y-4 flex-1">
          {/* Quick Add Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    editingId
                      ? (isFa ? 'ویرایش فکر…' : 'Edit thought...')
                      : t('vaultInputHint')
                  }
                  className="glass-input h-[48px] px-4 rounded-[16px] text-[14.5px] placeholder:text-ink-3 text-ink w-full"
                />
              </div>
              <button
                type="submit"
                className="pressable h-[48px] px-4 rounded-[16px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] text-[var(--accent-ink)] font-bold text-[13.5px] flex items-center justify-center gap-1 shadow-accent-sm-glow shrink-0"
              >
                {editingId ? (
                  t('save')
                ) : (
                  <>
                    <AddRoundedIcon sx={{ fontSize: 18 }} />
                    <span>{isFa ? 'ثبت' : 'Save'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Category Selectors */}
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const isSelected = category === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={clsx(
                      'pressable py-1.5 rounded-[12px] text-[11.5px] font-semibold border transition-all text-center',
                      isSelected
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]'
                        : 'bg-white/[0.02] text-ink-3 border-line hover:text-ink-2 hover:bg-white/[0.04]'
                    )}
                  >
                    {isFa ? c.labelFa : c.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Search filter */}
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchHint')}
                className="glass-input h-[40px] px-9 rounded-[14px] text-[13px] placeholder:text-ink-3 text-ink w-full"
              />
              <span className="absolute start-3 top-2.5 text-ink-3 pointer-events-none">
                <SearchRoundedIcon sx={{ fontSize: 17 }} />
              </span>
            </div>
          </form>

          {/* Thoughts List */}
          <div className="space-y-2 max-h-[32vh] overflow-y-auto pr-1">
            {filteredThoughts.length === 0 ? (
              <p className="text-center py-6 text-ink-3 text-[12.5px]">
                {search.trim()
                  ? t('noResultsFound')
                  : isFa
                  ? 'مخزن خالی است. هر فکری که چنگ می‌زند را اینجا بریز.'
                  : 'Vault is empty. Dump any distracting thought here.'}
              </p>
            ) : (
              filteredThoughts.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-[18px] bg-white/[0.035] border border-line space-y-2 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-ink-2 text-[10px] font-bold">
                      {isFa
                        ? CATEGORIES.find((c) => c.key === item.category)?.labelFa
                        : CATEGORIES.find((c) => c.key === item.category)?.labelEn}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setText(item.text);
                          setCategory(item.category);
                          inputRef.current?.focus();
                        }}
                        className="p-1 text-ink-3 hover:text-ink-2"
                        title={t('edit')}
                      >
                        <EditRoundedIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await repo.deleteThought(item.id);
                          toast(isFa ? 'فکر حذف شد' : 'Thought deleted', t('undo'), () => {
                            repo.restoreThought(item);
                          });
                        }}
                        className="p-1 text-ink-3 hover:text-warn"
                        title={t('delete')}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[14px] text-ink leading-relaxed">{item.text}</p>

                  <button
                    type="button"
                    onClick={() => handlePromote(item)}
                    className="pressable w-full py-1.5 rounded-[10px] bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[11.5px] font-bold flex items-center justify-center gap-1.5 hover:bg-[var(--accent-glow)]"
                  >
                    <ArrowCircleUpRoundedIcon sx={{ fontSize: 15 }} />
                    <span>{isFa ? 'ارتقا به کار' : 'Promote to Task'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </ViewTransition>
    </div>
  );
};
