import React, { useState } from 'react';
import { 
  X, CheckCircle2, Lock, Unlock, Save, 
  Package, AlertTriangle, Layers, Calendar, DollarSign, Tag, UserCheck, Sparkles
} from 'lucide-react';
import { LotRow, PackingDetails, PackingLine } from '../types';

interface PackingModalProps {
  lot: LotRow;
  onSave: (data: PackingDetails) => void;
  onClose: () => void;
  nameSuggestions?: string[];
  ripitSuggestions?: string[];
}

export const PackingModal: React.FC<PackingModalProps> = ({ 
  lot, 
  onSave, 
  onClose,
  nameSuggestions = [],
  ripitSuggestions = []
}) => {
  const initialPacking = lot.packing || {
    paymentDone: false,
    lines: [
      { id: 'p1', date: '', peice: '', rate: '', ripit: '', name: '' },
      { id: 'p2', date: '', peice: '', rate: '', ripit: '', name: '' },
      { id: 'p3', date: '', peice: '', rate: '', ripit: '', name: '' },
      { id: 'p4', date: '', peice: '', rate: '', ripit: '', name: '' },
    ],
  };

  // Ensure exactly 4 lines
  const ensure4Lines = (): PackingLine[] => {
    const existing = [...(initialPacking.lines || [])];
    while (existing.length < 4) {
      existing.push({
        id: `p${existing.length + 1}`,
        date: '',
        peice: '',
        rate: '',
        ripit: '',
        name: '',
      });
    }
    return existing.slice(0, 4);
  };

  const [lines, setLines] = useState<PackingLine[]>(ensure4Lines());
  const [paymentDone, setPaymentDone] = useState<boolean>(Boolean(initialPacking.paymentDone));

  const isReadOnly = paymentDone;

  const handleLineChange = (index: number, field: keyof PackingLine, value: any) => {
    if (isReadOnly) return;
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      [field]: value,
    };
    setLines(newLines);
  };

  // Calculations
  const totalJamaPieces = lines.reduce((acc, line) => {
    const val = typeof line.peice === 'number' ? line.peice : parseFloat(String(line.peice)) || 0;
    return acc + val;
  }, 0);

  const totalAmount = lines.reduce((acc, line) => {
    const p = typeof line.peice === 'number' ? line.peice : parseFloat(String(line.peice)) || 0;
    const r = typeof line.rate === 'number' ? line.rate : parseFloat(String(line.rate)) || 0;
    return acc + (p * r);
  }, 0);

  const cuttingPieces = typeof lot.pieceDetails.peice === 'number' ? lot.pieceDetails.peice : 0;
  const balanceRemaining = cuttingPieces ? cuttingPieces - totalJamaPieces : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      lines: lines.map(line => ({
        ...line,
        peice: line.peice === '' ? '' : Number(line.peice),
        rate: line.rate === '' ? '' : Number(line.rate),
        ripit: line.ripit?.trim() || '',
        name: line.name?.trim() || '',
      })),
      paymentDone,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                Lot #{lot.lotNo}
              </span>
              <span className="text-xs text-emerald-200">पैकिंग 4-पार्ट प्रविष्टि (Multi-part Packing Ledger)</span>
              {paymentDone && (
                <span className="px-2.5 py-0.5 rounded-full bg-green-500 text-white text-xs font-extrabold flex items-center gap-1 shadow-md ring-1 ring-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  भुगतान पूरा (Payment Clear)
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-300" />
              पैकिंग प्रविष्टि (Packing 4 Lines)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only / Payment Clear banner */}
        {paymentDone && (
          <div className="bg-green-50 dark:bg-green-950/50 border-b border-green-300 dark:border-green-800 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-900 dark:text-green-100 text-xs font-medium">
              <Lock className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                <strong>Payment Clear चुनी गई है:</strong> मुख्य तालिका में पैकिंग सेल ब्राइट ग्रीन (Bright Green) दिखेगा और चारों लाइनें लॉक हैं।
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPaymentDone(false)}
              className="text-xs text-green-700 hover:text-green-900 dark:text-green-300 underline font-bold flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
            >
              <Unlock className="w-3 h-3" />
              अनलॉक करें (Edit Lines)
            </button>
          </div>
        )}

        {/* Jama Preview Summary Bar */}
        <div className="bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">कुल कटिंग पीस (Cut)</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{cuttingPieces || '—'}</span>
            </div>
            <div className="border-l border-zinc-300 dark:border-zinc-700 pl-4">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[11px]">
                कुल जमा पीस (Jama Total)
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                {totalJamaPieces} पीस
              </span>
            </div>
            {cuttingPieces > 0 && (
              <div className="border-l border-zinc-300 dark:border-zinc-700 pl-4">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">शेष पैकिंग बाकी (Remaining)</span>
                <span className={`font-bold ${balanceRemaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-600'}`}>
                  {balanceRemaining} पीस
                </span>
              </div>
            )}
          </div>

          {totalAmount > 0 && (
            <div className="text-right">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">कुल पैकिंग भुगतान (Packing Total Amount)</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Datalists for Packing Suggestions */}
        <datalist id="packing-names-datalist">
          {nameSuggestions.map((n, i) => (
            <option key={i} value={n} />
          ))}
        </datalist>
        <datalist id="packing-ripits-datalist">
          {ripitSuggestions.map((r, i) => (
            <option key={i} value={r} />
          ))}
        </datalist>

        {/* 4 Lines Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-2">
            <span>
              पैकिंग कई चरणों में (parts) में होती है, इसलिए <strong>4 पंक्तियों</strong> में एंट्री दर्ज करें। कुल पीस <strong>Jama</strong> कॉलम में जुड़ेगा।
            </span>
            {(nameSuggestions.length > 0 || ripitSuggestions.length > 0) && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5" /> पिछली प्रविष्टियों के सुझाव उपलब्ध
              </span>
            )}
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div 
                key={line.id || idx}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700">
                    लाइन {idx + 1} (Part {idx + 1})
                  </span>
                  {line.peice && line.rate ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{((Number(line.peice) || 0) * (Number(line.rate) || 0)).toFixed(2)}
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {/* Date */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      Date (दिनांक)
                    </label>
                    <input
                      type="date"
                      disabled={isReadOnly}
                      value={line.date}
                      onChange={(e) => handleLineChange(idx, 'date', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed text-xs"
                    />
                  </div>

                  {/* Peice */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-600" />
                      Peice (पीस)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="उदा. 400"
                      disabled={isReadOnly}
                      value={line.peice}
                      onChange={(e) => handleLineChange(idx, 'peice', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed text-xs font-bold"
                    />
                  </div>

                  {/* Rate */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      Rate (दर ₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="उदा. 3.00"
                      disabled={isReadOnly}
                      value={line.rate}
                      onChange={(e) => handleLineChange(idx, 'rate', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed text-xs"
                    />
                  </div>

                  {/* Ripit / Packing Type with Suggestions */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      Ripit / रिपिट (विवरण)
                    </label>
                    <input
                      type="text"
                      list="packing-ripits-datalist"
                      placeholder="उदा. Box Pack, Poly"
                      disabled={isReadOnly}
                      value={line.ripit}
                      onChange={(e) => handleLineChange(idx, 'ripit', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed text-xs"
                    />
                  </div>

                  {/* Name with Suggestions */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      Name (नाम)
                    </label>
                    <input
                      type="text"
                      list="packing-names-datalist"
                      placeholder="उदा. मुन्ना पैकिंग"
                      disabled={isReadOnly}
                      value={line.name}
                      onChange={(e) => handleLineChange(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick-Pick Chips for Packer Names and Ripits */}
          {(nameSuggestions.length > 0 || ripitSuggestions.length > 0) && !isReadOnly && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              {nameSuggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500 font-bold">पैकर नाम सुझाव:</span>
                  {nameSuggestions.slice(0, 6).map((n, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        // fill in first empty line name or line 1
                        const emptyIdx = lines.findIndex(l => !l.name);
                        handleLineChange(emptyIdx !== -1 ? emptyIdx : 0, 'name', n);
                      }}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-emerald-100 hover:text-emerald-800 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    >
                      + {n}
                    </button>
                  ))}
                </div>
              )}
              {ripitSuggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500 font-bold">रिपिट / मार्का सुझाव:</span>
                  {ripitSuggestions.slice(0, 6).map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const emptyIdx = lines.findIndex(l => !l.ripit);
                        handleLineChange(emptyIdx !== -1 ? emptyIdx : 0, 'ripit', r);
                      }}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-emerald-100 hover:text-emerald-800 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    >
                      + {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Clear Optional Selector (Bright Green) */}
          <div className="pt-2">
            <div className={`p-4 rounded-xl border-2 transition-all ${
              paymentDone 
                ? 'bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/25 ring-2 ring-green-400/50' 
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className={`text-sm font-extrabold flex items-center gap-1.5 ${paymentDone ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {paymentDone ? (
                      <CheckCircle2 className="w-5 h-5 text-white fill-green-700" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    पैकिंग पेमेंट क्लियर विकल्प (Payment Clear Option)
                  </h4>
                  <p className={`text-xs mt-1 ${paymentDone ? 'text-green-50 font-medium' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {paymentDone 
                      ? '✓ Payment Clear चुना गया है! मुख्य तालिका का पैकिंग सेल ब्राइट ग्रीन (Bright Green) दिखेगा।' 
                      : 'सेल को ब्राइट ग्रीन करने और पेमेंट क्लियर मार्क करने के लिए दाईं ओर विकल्प चुनें।'}
                  </p>
                </div>

                {/* Option Selector Toggle */}
                <div className="flex items-center bg-black/15 dark:bg-black/30 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-black/10">
                  <button
                    type="button"
                    onClick={() => setPaymentDone(false)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      !paymentDone 
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                        : 'text-green-100 hover:text-white'
                    }`}
                  >
                    बाकी (Pending)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentDone(true)}
                    className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      paymentDone 
                        ? 'bg-white text-green-700 shadow-md ring-2 ring-white' 
                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Payment Clear (Bright Green)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              सेव करें (Save 4 Lines)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
