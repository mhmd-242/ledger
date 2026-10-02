import React, { useState } from 'react';
import { formatETB } from '../../utils/formatters';
import { Wallet, X, ArrowRight } from 'lucide-react';

interface StartingBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStartingBalance: (amount: number) => void;
}

export const StartingBalanceModal: React.FC<StartingBalanceModalProps> = ({
  isOpen,
  onClose,
  onSaveStartingBalance,
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    onSaveStartingBalance(parsed);
    setAmountStr('');
    setErrorMsg('');
    onClose();
  };

  const parsedAmount = parseFloat(amountStr);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-card border border-surface-border p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Starting Balance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Enter the money you currently have in your wallet and bank accounts. This will be saved as an income record named <strong>"Opening balance"</strong> dated today.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-surface-bg border border-surface-border">
            <label
              htmlFor="starting-balance-input"
              className="block text-xs font-semibold text-neutral-500 mb-1"
            >
              Current Funds (ETB)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-neutral-400 select-none">
                ETB
              </span>
              <input
                id="starting-balance-input"
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) {
                    setAmountStr(val);
                    setErrorMsg('');
                  }
                }}
                className="w-full text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 bg-transparent outline-none"
              />
            </div>
          </div>

          {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isValid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>Save {isValid ? formatETB(parsedAmount) : ''}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
