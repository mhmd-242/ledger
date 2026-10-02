import React, { useState, useEffect } from 'react';
import { Category, TransactionType } from '../../types';
import { CategoryIcon, AVAILABLE_ICONS } from '../Common/CategoryIcon';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  expenseCategories: Category[];
  incomeCategories: Category[];
  onAddCategory: (cat: Omit<Category, 'id' | 'isCustom'>, type: TransactionType) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string, type: TransactionType) => void;
}

const COLOR_PALETTE = [
  '#f97316', // Orange
  '#0284c7', // Sky
  '#6366f1', // Indigo
  '#eab308', // Amber
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#84cc16', // Lime
  '#64748b', // Slate
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  expenseCategories,
  incomeCategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>(initialType);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Utensils');
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [addError, setAddError] = useState('');

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    setActiveTab(initialType);
  }, [initialType]);

  if (!isOpen) return null;

  const currentCategories = activeTab === 'income' ? incomeCategories : expenseCategories;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError('Category name is required');
      return;
    }

    if (currentCategories.some((c) => c.name.toLowerCase() === newName.trim().toLowerCase())) {
      setAddError('A category with this name already exists');
      return;
    }

    onAddCategory(
      {
        name: newName.trim(),
        iconName: newIcon,
        color: newColor,
      },
      activeTab
    );

    setNewName('');
    setIsCreating(false);
    setAddError('');
  };

  const startRename = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditingName(cat.name);
  };

  const saveRename = (cat: Category) => {
    if (!editingName.trim()) return;
    onUpdateCategory({
      ...cat,
      name: editingName.trim(),
    });
    setEditingCatId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl bg-surface-card border border-surface-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-surface-border shrink-0">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Manage Categories
            </h3>
            <p className="text-xs text-neutral-500">
              Customize your expense and income tags
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense vs Income tab */}
        <div className="p-3 border-b border-surface-border bg-surface-bg/50">
          <div className="p-1 rounded-xl bg-surface-card border border-surface-border flex items-center text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('expense');
                setIsCreating(false);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'expense'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Expense Categories ({expenseCategories.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('income');
                setIsCreating(false);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Income Categories ({incomeCategories.length})
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add {activeTab} category</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-4 rounded-xl bg-surface-bg border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  New {activeTab === 'income' ? 'Income' : 'Expense'} Category
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Consulting"
                  value={newName}
                  maxLength={30}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setAddError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-sm text-neutral-900 dark:text-neutral-100 outline-none"
                />
                {addError && <p className="text-xs text-red-500 mt-1">{addError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Color tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const isSelected = newIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setNewIcon(item.name)}
                        className={`p-2 rounded-lg flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-surface-border bg-surface-card text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        <CategoryIcon name={item.name} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Create category
              </button>
            </form>
          )}

          <div className="space-y-1.5 divide-y divide-surface-border">
            {currentCategories.map((cat) => {
              const isEditing = editingCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="pt-2 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-2 py-1 rounded bg-surface-bg border border-surface-border text-sm flex-1 text-neutral-900 dark:text-neutral-100"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRename(cat)}
                          className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {cat.name}
                        </p>
                        {cat.isCustom && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                            Custom
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startRename(cat)}
                        title="Rename category"
                        aria-label={`Rename ${cat.name}`}
                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {cat.isCustom && (
                        <button
                          onClick={() => onDeleteCategory(cat.id, activeTab)}
                          title="Delete category"
                          aria-label={`Delete ${cat.name}`}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
