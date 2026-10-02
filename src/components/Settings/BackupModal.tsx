import React, { useRef, useState } from 'react';
import { StorageService } from '../../services/storage';
import { Download, Upload, RotateCcw, Trash2, X, Check, AlertCircle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const json = StorageService.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `ledger-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({ text: 'Backup exported successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage({ text: 'Failed to generate backup export.', isError: true });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importBackup(content);
      if (res.success) {
        setStatusMessage({ text: 'Backup restored successfully!' });
        onDataChanged();
        setTimeout(() => {
          setStatusMessage(null);
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ text: res.error || 'Failed to import backup.', isError: true });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDemo = () => {
    StorageService.resetDemo();
    setStatusMessage({ text: 'Reset to sample 6-month demo data.' });
    onDataChanged();
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    StorageService.clearAll();
    setStatusMessage({ text: 'All expenses cleared.' });
    setConfirmClear(false);
    onDataChanged();
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-card border border-surface-border p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Data & Backup
            </h3>
            <p className="text-xs text-neutral-500">
              Export, import or reset local data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Export button */}
          <button
            onClick={handleExport}
            className="w-full p-3 rounded-xl border border-surface-border bg-surface-bg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm font-semibold flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="leading-tight">Export JSON backup</p>
              <span className="text-[11px] font-normal text-neutral-500">
                Download your expenses and budgets
              </span>
            </div>
          </button>

          {/* Import file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 rounded-xl border border-surface-border bg-surface-bg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm font-semibold flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="leading-tight">Import JSON backup</p>
              <span className="text-[11px] font-normal text-neutral-500">
                Restore data from a JSON file
              </span>
            </div>
          </button>

          <hr className="border-surface-border my-2" />

          {/* Load Sample Demo */}
          <button
            onClick={handleResetDemo}
            className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-card hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-2.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
            <span>Load 6-month sample demo data</span>
          </button>

          {/* Clear all */}
          <button
            onClick={handleClearAll}
            className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              confirmClear
                ? 'bg-red-600 text-white border-red-600'
                : 'border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmClear ? 'Click again to confirm clear' : 'Clear all data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
