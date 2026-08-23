import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { GlassSheet } from '../../components/ui/GlassSheet';
import { Pill } from '../../components/ui/Pill';
import { GlassField } from '../../components/ui/GlassField';
import { repo } from '../../db/repo';
import { toast } from '../../components/ui/Toast';
import { todayKey } from '../../utils/fa';
import type { ThoughtCategoryType, ThoughtRecord } from '../../db/schema';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { clsx } from 'clsx';

interface VaultSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { key: ThoughtCategoryType; labelFa: string; labelEn: string }[] = [
  { key: 'idea', labelFa: 'ایده', labelEn: 'Idea' },
  { key: 'worry', labelFa: 'نگرانی', labelEn: 'Worry' },
  { key: 'side_task', labelFa: 'کار فرعی', labelEn: 'Side Task' },
];

export const VaultSheet: React.FC<VaultSheetProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language === 'fa';

  const [text, setText] = useState('');
  const [category, setCategory] = useState<ThoughtCategoryType>('idea');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const thoughts = useLiveQuery(
    () => repo.thoughts(),
    [isOpen]
  );

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
  };

  const handlePromote = async (thought: ThoughtRecord) => {
    const onToday = await repo.promoteThought(thought, todayKey());
    toast(
      onToday
        ? (isFa ? 'به کارهای امروز اضافه شد' : "Added to today's tasks")
        : (isFa ? 'برای ویزارد فردا ذخیره شد' : "Saved for tomorrow's wizard")
    );
  };

  const filteredThoughts = (thoughts || []).filter((t) =>
    search.trim() ? t.text.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('brainVaultTitle')}
      sub={t('brainVaultSub')}
    >
      <div className="space-y-4">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="flex gap-2">
            <GlassField
              value={text}
              onChange={(e) => setText(e.target.value)}
              hint={editingId ? (isFa ? 'ویرایش فکر…' : 'Edit thought...') : t('vaultInputHint')}
              className="flex-1"
            />
            <Pill
              label={editingId ? t('save') : (isFa ? 'ثبت' : 'Save')}
              pillStyle="accent"
              expanded={false}
              onClick={() => handleSubmit()}
            />
          </div>

          {/* Category Chips */}
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
              const isSelected = category === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={clsx(
                    'pressable py-2 rounded-[12px] text-[12px] font-semibold border transition-all text-center',
                    isSelected
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent-border)]'
                      : 'bg-transparent text-ink-3 border-line hover:text-ink-2'
                  )}
                >
                  {isFa ? c.labelFa : c.labelEn}
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <GlassField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            hint={t('searchHint')}
          />
        </form>

        {/* Thoughts List */}
        <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
          {filteredThoughts.length === 0 ? (
            <p className="text-center py-6 text-ink-3 text-[13px]">
              {search.trim() ? t('noResultsFound') : (isFa ? 'هنوز فکری ثبت نشده.' : 'No thoughts recorded yet.')}
            </p>
          ) : (
            filteredThoughts.map((tItem) => (
              <div
                key={tItem.id}
                className="p-3.5 rounded-[18px] bg-white/[0.04] border border-line space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-ink-2 text-[10px] font-bold">
                    {isFa
                      ? CATEGORIES.find((c) => c.key === tItem.category)?.labelFa
                      : CATEGORIES.find((c) => c.key === tItem.category)?.labelEn}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(tItem.id);
                        setText(tItem.text);
                        setCategory(tItem.category);
                      }}
                      className="p-1 text-ink-3 hover:text-ink-2"
                      title={t('edit')}
                    >
                      <EditRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await repo.deleteThought(tItem.id);
                        toast(isFa ? 'فکر حذف شد' : 'Thought deleted', t('undo'), () => {
                          repo.restoreThought(tItem);
                        });
                      }}
                      className="p-1 text-ink-3 hover:text-warn"
                      title={t('delete')}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>

                <p className="text-[14px] text-ink leading-relaxed">{tItem.text}</p>

                <button
                  type="button"
                  onClick={() => handlePromote(tItem)}
                  className="pressable w-full py-1.5 rounded-[10px] bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[11.5px] font-bold flex items-center justify-center gap-1.5"
                >
                  <ArrowCircleUpRoundedIcon sx={{ fontSize: 16 }} />
                  <span>{isFa ? 'ارتقا به کار' : 'Promote to Task'}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassSheet>
  );
};
