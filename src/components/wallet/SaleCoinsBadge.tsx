import React, { useState } from 'react';
import { useWalletStore } from '../../store/walletStore';
import { SaleCoinsExplanationModal } from './SaleCoinsExplanationModal';
import { RechargeModal } from './RechargeModal';
import { Plus } from 'lucide-react';

interface SaleCoinsBadgeProps {
  className?: string;
  showAddButton?: boolean;
}

export function SaleCoinsBadge({ className = '', showAddButton = true }: SaleCoinsBadgeProps) {
  const balance = useWalletStore((state) => state.balance);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {/* Main Coin Pill */}
        <button
          type="button"
          onClick={() => setIsExplanationOpen(true)}
          className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1E2025] hover:bg-slate-50 dark:hover:bg-[#252830] border border-[#DDE1E5] dark:border-[#2A2D34] text-[#1C1E21] dark:text-[#F3F4F6] text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
          title="Ver cómo funcionan las SaleCoins"
        >
          <span className="text-sm">🪙</span>
          <span className="font-black text-[#1C1E21] dark:text-[#F3F4F6]">{balance}</span>
          <span className="text-[11px] font-semibold text-[#65676B] dark:text-[#9CA3AF]">SaleCoins</span>
        </button>

        {/* Optional quick + recharge shortcut */}
        {showAddButton && (
          <button
            type="button"
            onClick={() => setIsRechargeOpen(true)}
            className="w-6 h-6 rounded-full bg-[#FF5733] hover:bg-[#E04826] dark:bg-[#FF6B4A] dark:hover:bg-[#FF5733] active:scale-90 text-white flex items-center justify-center text-xs font-black shadow-2xs transition-all cursor-pointer"
            title="Recargar SaleCoins"
            aria-label="Recargar SaleCoins"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Explanation Modal */}
      <SaleCoinsExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        onOpenRecharge={() => setIsRechargeOpen(true)}
      />

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
    </>
  );
}
