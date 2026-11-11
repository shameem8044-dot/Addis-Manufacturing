import React, { useState } from 'react';
import { 
  X, Calendar, Layers, DollarSign, UserCheck, 
  CheckCircle2, Lock, Unlock, Save, AlertTriangle, Sparkles 
} from 'lucide-react';
import { JobWorkDetails, DamageDetails, PrintDetails, LotRow } from '../types';

export type JobDepartmentType = 
  | 'embroidery' 
  | 'fabrication' 
  | 'tanki' 
  | 'washing' 
  | 'damage' 
  | 'print';

interface JobWorkModalProps {
  type: JobDepartmentType;
  lot: LotRow;
  onSave: (data: any) => void;
  onClose: () => void;
  nameSuggestions?: string[];
  washingTypeSuggestions?: string[];
}

const DEPARTMENT_CONFIG: Record<JobDepartmentType, {
  title: string;
  hindiTitle: string;
  themeColor: string;
  hasRate: boolean;
  hasWashingType: boolean;
}> = {
  embroidery: {
    title: 'Embroidery Details',
    hindiTitle: 'कढ़ाई विवरण (Embroidery)',
    themeColor: 'from-amber-600 to-orange-700',
    hasRate: true,
    hasWashingType: false,
  },
  fabrication: {
    title: 'Fabrication Details',
    hindiTitle: 'सिलाई / फैब्रिकेशन विवरण (Fabrication)',
    themeColor: 'from-indigo-600 to-purple-700',
    hasRate: true,
    hasWashingType: false,
  },
  tanki: {
    title: 'Tanki Details',
    hindiTitle: 'टांकी विवरण (Tanki Work)',
    themeColor: 'from-teal-600 to-cyan-700',
    hasRate: true,
    hasWashingType: false,
  },
  washing: {
    title: 'Washing Details',
    hindiTitle: 'वाशिंग विवरण (Washing Plant)',
    themeColor: 'from-sky-600 to-blue-700',
    hasRate: true,
    hasWashingType: true,
  },
  damage: {
    title: 'Leser Details',
    hindiTitle: 'लेज़र विवरण (Leser Work)',
    themeColor: 'from-rose-600 to-pink-700',
    hasRate: false,
    hasWashingType: false,
  },
  print: {
    title: 'Print Details',
    hindiTitle: 'प्रिंटिंग विवरण (Print Work)',
    themeColor: 'from-purple-600 to-pink-700',
    hasRate: false,
    hasWashingType: false,
  },
};

export const JobWorkModal: React.FC<JobWorkModalProps> = ({ 
  type, 
  lot, 
  onSave, 
  onClose,
  nameSuggestions = [],
  washingTypeSuggestions = [],
}) => {
  const config = DEPARTMENT_CONFIG[type];
  const initialData: any = lot[type] || {};

  const [date, setDate] = useState<string>(initialData.date || new Date().toISOString().slice(0, 10));
  const [peice, setPeice] = useState<number | ''>(initialData.peice ?? '');
  const [rate, setRate] = useState<number | ''>(initialData.rate ?? '');
  const [washingType, setWashingType] = useState<string>(initialData.washingType || '');
  const [name, setName] = useState<string>(initialData.name || '');
  const [paymentDone, setPaymentDone] = useState<boolean>(Boolean(initialData.paymentDone));

  // Rate calculation
  const numPieces = typeof peice === 'number' ? peice : parseFloat(String(peice)) || 0;
  const numRate = typeof rate === 'number' ? rate : parseFloat(String(rate)) || 0;
  const totalAmount = numPieces * numRate;

  const isReadOnly = paymentDone;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      date,
      peice: peice === '' ? '' : Number(peice),
      name: name.trim(),
      paymentDone,
    };
    if (config.hasRate) {
      payload.rate = rate === '' ? '' : Number(rate);
    }
    if (config.hasWashingType) {
      payload.washingType = washingType.trim();
    }
    onSave(payload);
    onClose();
  };

  const handleTogglePaymentDone = () => {
    setPaymentDone(!paymentDone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.themeColor} text-white p-5 flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                Lot #{lot.lotNo}
              </span>
              {paymentDone && (
                <span className="px-2.5 py-0.5 rounded-full bg-green-500 text-white text-xs font-extrabold flex items-center gap-1 shadow-md ring-1 ring-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  भुगतान पूरा (Payment Clear)
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              {config.hindiTitle}
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

        {/* Payment Clear Active Notice */}
        {paymentDone && (
          <div className="bg-green-50 dark:bg-green-950/50 border-b border-green-300 dark:border-green-800 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-900 dark:text-green-100 text-xs font-medium">
              <Lock className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                <strong>Payment Clear चुनी गई है:</strong> मुख्य टेबल का सेल ब्राइट ग्रीन (Bright Green) हो गया है और डेटा लॉक है।
              </span>
            </div>
            <button
              type="button"
              onClick={handleTogglePaymentDone}
              className="text-xs text-green-700 hover:text-green-900 dark:text-green-300 underline font-bold flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
            >
              <Unlock className="w-3 h-3" />
              अनलॉक करें (Edit)
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. Date */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              दिनांक (Date)
            </label>
            <input
              type="date"
              disabled={isReadOnly}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>

          {/* 2. Worker / Party / Vendor Name with Suggestions */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                कारीगर / पार्टी का नाम (Name)
              </span>
              {nameSuggestions.length > 0 && (
                <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" /> पिछले नाम उपलब्ध
                </span>
              )}
            </label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              list={`datalist-names-${type}`}
              placeholder="उदा. कारीगर या फर्म का नाम"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
            />
            <datalist id={`datalist-names-${type}`}>
              {nameSuggestions.map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>

            {/* Clickable Quick-Pick Chips */}
            {nameSuggestions.length > 0 && !isReadOnly && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-semibold">सुझाव (Suggestions):</span>
                {nameSuggestions.slice(0, 6).map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setName(sugg)}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/60 dark:hover:text-blue-200 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 mt-1">
              * यह नाम मुख्य तालिका के सेल में सबसे ऊपर बोल्ड दिखेगा।
            </p>
          </div>

          {/* 3. Peice & Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                पीस संख्या (Peice)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="उदा. 1200"
                disabled={isReadOnly}
                value={peice}
                onChange={(e) => setPeice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-base"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                * नाम के नीचे सेल में यह संख्या दिखेगी।
              </p>
            </div>

            {/* Rate (if applicable) */}
            {config.hasRate && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                  दर / प्रति पीस (Rate ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="उदा. 4.50"
                  disabled={isReadOnly}
                  value={rate}
                  onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-base"
                />
              </div>
            )}
          </div>

          {/* Washing Type / Process (if washing) */}
          {config.hasWashingType && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>वाशिंग प्रकार / प्रोसेस (Washing Type / Details)</span>
                {washingTypeSuggestions.length > 0 && (
                  <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-amber-500" /> सुझाव उपलब्ध
                  </span>
                )}
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                list="washing-types-datalist"
                placeholder="उदा. एंजाइम वाश, बायो वाश, सिलिकॉन फिनिश, एसिड वाश"
                value={washingType}
                onChange={(e) => setWashingType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <datalist id="washing-types-datalist">
                {washingTypeSuggestions.map((w, i) => (
                  <option key={i} value={w} />
                ))}
              </datalist>
              {washingTypeSuggestions.length > 0 && !isReadOnly && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 font-semibold">सुझाव:</span>
                  {washingTypeSuggestions.slice(0, 5).map((w, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setWashingType(w)}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] hover:bg-sky-100 hover:text-sky-800 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Total calculation strip */}
          {config.hasRate && numPieces > 0 && numRate > 0 && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                कुल राशि (Total Amount): {numPieces} × ₹{numRate}
              </span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Payment Clear Optional Selector (Turns cell Bright Green) */}
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
                    पेमेंट क्लियर विकल्प (Payment Clear Option)
                  </h4>
                  <p className={`text-xs mt-1 ${paymentDone ? 'text-green-50 font-medium' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {paymentDone 
                      ? '✓ Payment Clear चुना गया है! मुख्य तालिका का सेल ब्राइट ग्रीन (Bright Green) दिखेगा।' 
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

          {/* Bottom Actions */}
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
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              सेव करें (Save Details)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
