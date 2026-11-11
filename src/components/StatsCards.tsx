import React from 'react';
import { Layers, PackageCheck, AlertOctagon, CheckCircle2, TrendingUp } from 'lucide-react';
import { LotRow } from '../types';
import { calculateJamaPieces } from '../utils/lotHelper';

interface StatsCardsProps {
  lots: LotRow[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ lots }) => {
  const totalLots = lots.length;
  
  const totalCutPieces = lots.reduce((acc, lot) => {
    const val = typeof lot.pieceDetails.peice === 'number' ? lot.pieceDetails.peice : parseFloat(String(lot.pieceDetails.peice)) || 0;
    return acc + val;
  }, 0);

  const totalJamaPieces = lots.reduce((acc, lot) => {
    return acc + calculateJamaPieces(lot.packing);
  }, 0);

  const totalDamagePieces = lots.reduce((acc, lot) => {
    const val = typeof lot.damage?.peice === 'number' ? lot.damage.peice : parseFloat(String(lot.damage?.peice)) || 0;
    return acc + val;
  }, 0);

  // Completed payments count across all job stages
  let totalJobsCount = 0;
  let paidJobsCount = 0;

  lots.forEach(lot => {
    const stages = [
      lot.embroidery,
      lot.fabrication,
      lot.tanki,
      lot.washing,
      lot.damage,
      lot.print,
    ];
    stages.forEach(stage => {
      if (stage && (stage.name || stage.peice)) {
        totalJobsCount++;
        if (stage.paymentDone) paidJobsCount++;
      }
    });
    if (lot.packing?.lines?.some(l => l.name || l.peice)) {
      totalJobsCount++;
      if (lot.packing.paymentDone) paidJobsCount++;
    }
  });

  const completionPercent = totalCutPieces > 0 
    ? Math.min(100, Math.round((totalJamaPieces / totalCutPieces) * 100)) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
      {/* 1. Total Lots */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            कुल लॉट्स (Total Lots)
          </span>
          <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {totalLots}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Total Pieces Cut */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            कटिंग पीस (Total Cut)
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
            {totalCutPieces.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Total Jama Pieces (Packed) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            कुल जमा / पैक (Jama)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalJamaPieces.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-zinc-400 font-medium">({completionPercent}%)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <PackageCheck className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Total Leser */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            कुल लेज़र (Leser)
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {totalDamagePieces.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
      </div>

      {/* 5. Payments Cleared Ratio */}
      <div className="col-span-2 lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            भुगतान संपन्न (Payment Done)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {paidJobsCount}
            </span>
            <span className="text-xs text-zinc-400">/ {totalJobsCount} जॉब्स</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
