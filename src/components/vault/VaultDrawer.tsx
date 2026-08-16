import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Trash2, ArrowUpRight, Search, Plus, Brain } from 'lucide-react';
import { db } from '../../db';
import { repo } from '../../db/repo';
import type { Thought, ThoughtCategoryType } from '../../db/schema';
import { Modal } from '../ui/Modal';
import { GlassCard } from '../ui/GlassCard';
import { GlassField } from '../ui/GlassField';
import { Pill } from '../ui/Pill';
import { useToast } from '../ui/Toast';
import { todayKey } from '../../lib/fa';

interface VaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultDrawer: React.FC<VaultDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [inputVal, setInputVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<ThoughtCategoryType>('idea');

  // Live Dexie query
  const thoughts = useLiveQuery(() => {
    return db.thoughts.filter((th) => th.deleted_at === null).reverse().sortBy('created_at');
  }, []);

  const handleSaveThought = async () => {
    if (!inputVal.trim()) return;

    try {
      await repo.addThought(inputVal, category);
      setInputVal('');
      showToast(t('vault.toastPromotedToToday') + ' ✓');
    } catch {
      showToast(t('common.errorTitle'));
    }
  };

  const handleDelete = async (id: string) => {
    await repo.deleteThought(id);
    showToast(t('vault.toastThoughtDeleted'));
  };

  const handlePromote = async (thought: Thought) => {
    await repo.promoteThoughtToTask(thought, todayKey());
    showToast(t('vault.toastPromotedToToday'));
  };

  const filteredThoughts = (thoughts || []).filter((th) =>
    searchQuery.trim() ? th.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('vault.brainVaultTitle')}
      subtitle={t('vault.brainVaultSub')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Input & Category Selection */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <GlassField
              hint={t('vault.thoughtHint')}
              value={inputVal}
              onChange={setInputVal}
              onSubmit={handleSaveThought}
              className="flex-1"
            />
            <Pill
              pillStyle="ember"
              expanded={false}
              disabled={!inputVal.trim()}
              onClick={handleSaveThought}
              className="h-[46px] px-4"
              icon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              {t('common.save')}
            </Pill>
          </div>

          <div className="flex items-center gap-2">
            {(['idea', 'worry', 'side_task'] as ThoughtCategoryType[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex-1 py-2 px-3 rounded-pill text-xs font-semibold border transition-all ${
                  category === cat
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                    : 'border-glass-line text-ink3 hover:text-ink hover:border-white/20'
                }`}
              >
                {cat === 'idea'
                  ? t('vault.filterIdea')
                  : cat === 'worry'
                  ? t('vault.filterWorry')
                  : t('vault.filterTask')}
              </button>
            ))}
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
          <input
            type="text"
            placeholder={t('vault.searchHint')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-glass-line rounded-xl pl-9 pr-4 py-2 text-xs text-ink placeholder:text-ink3 outline-none focus:border-white/25"
          />
        </div>

        {/* Thoughts List */}
        <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
          {filteredThoughts.length > 0 ? (
            filteredThoughts.map((th) => (
              <GlassCard
                key={th.id}
                className="flex items-center justify-between p-3.5 bg-white/[0.04] hover:bg-white/[0.07] transition-all"
              >
                <div className="flex flex-col flex-1 min-w-0 pr-3">
                  <span className="text-[14px] font-medium text-ink leading-snug">{th.text}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-glass-line text-ink3">
                      {th.category === 'idea'
                        ? t('vault.filterIdea')
                        : th.category === 'worry'
                        ? t('vault.filterWorry')
                        : t('vault.filterTask')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePromote(th)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-pill bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                    title={t('vault.promoteToTodayAction')}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{t('vault.promoteToTodayAction')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(th.id)}
                    className="p-1.5 rounded-lg text-ink3 hover:text-warn hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="py-8 text-center text-ink3 text-xs space-y-2">
              <Brain className="w-8 h-8 mx-auto opacity-30 text-[var(--accent)]" />
              <p>{searchQuery ? t('vault.noResultsFound') : t('vault.emptyVaultSub')}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
