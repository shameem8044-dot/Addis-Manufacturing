import React, { useState } from 'react';
import { X, Calendar, Layers, Ruler, Shirt, UserCheck, Save, Sparkles } from 'lucide-react';
import { LotRow, PieceDetails } from '../types';

interface PieceModalProps {
  lot: LotRow;
  onSave: (updatedPieceDetails: PieceDetails) => void;
  onClose: () => void;
  suggestions?: {
    sizes: string[];
    fabrics: string[];
    masters: string[];
  };
}

export const PieceModal: React.FC<PieceModalProps> = ({ 
  lot, 
  onSave, 
  onClose,
  suggestions = { sizes: [], fabrics: [], masters: [] }
}) => {
  const [formData, setFormData] = useState<PieceDetails>({
    date: lot.pieceDetails.date || new Date().toISOString().slice(0, 10),
    peice: lot.pieceDetails.peice ?? '',
    size: lot.pieceDetails.size || '',
    fabric: lot.pieceDetails.fabric || '',
    master: lot.pieceDetails.master || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      peice: formData.peice === '' ? '' : Number(formData.peice),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold uppercase tracking-wider">
                Lot #{lot.lotNo}
              </span>
              <span className="text-xs text-blue-200">काटने की प्रविष्टि / Production Details</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-300" />
              पीस एवं कटिंग विवरण (Piece &amp; Cutting Details)
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            कृपया कटिंग के पीस, साइज़, कपड़ा और मास्टर की प्रविष्टि करें। पिछली प्रविष्टियों के सुझाव नीचे दिए गए हैं।
          </p>

          {/* 1. Date */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              1. दिनांक (Date)
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            />
          </div>

          {/* 2. Peice */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              2. पीस संख्या (Total Pieces / Peice)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="उदा. 1200"
              required
              value={formData.peice}
              onChange={(e) => setFormData({ ...formData, peice: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-base"
            />
          </div>

          {/* 3. Size */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-blue-600" />
                3. साइज़ (Size / Sizes)
              </span>
              {suggestions.sizes.length > 0 && (
                <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" /> पिछले सुझाव उपलब्ध
                </span>
              )}
            </label>
            <input
              type="text"
              list="sizes-datalist"
              placeholder="उदा. S, M, L, XL या 28, 30, 32"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <datalist id="sizes-datalist">
              {suggestions.sizes.map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>
            {suggestions.sizes.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-semibold">सुझाव (Suggestions):</span>
                {suggestions.sizes.slice(0, 6).map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, size: sugg })}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/60 dark:hover:text-blue-200 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Fabric */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-blue-600" />
                4. कपड़ा / फैब्रिक (Fabric)
              </span>
              {suggestions.fabrics.length > 0 && (
                <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" /> पिछले सुझाव उपलब्ध
                </span>
              )}
            </label>
            <input
              type="text"
              list="fabrics-datalist"
              placeholder="उदा. Cotton Twill, Rayon, Denim, Matty"
              value={formData.fabric}
              onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <datalist id="fabrics-datalist">
              {suggestions.fabrics.map((f, i) => (
                <option key={i} value={f} />
              ))}
            </datalist>
            {suggestions.fabrics.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-semibold">सुझाव (Suggestions):</span>
                {suggestions.fabrics.slice(0, 6).map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, fabric: sugg })}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/60 dark:hover:text-blue-200 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Master name */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                5. मास्टर का नाम (Master Name)
              </span>
              {suggestions.masters.length > 0 && (
                <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" /> पिछले सुझाव उपलब्ध
                </span>
              )}
            </label>
            <input
              type="text"
              list="masters-datalist"
              placeholder="उदा. Master Aslam, Master Ramesh"
              value={formData.master}
              onChange={(e) => setFormData({ ...formData, master: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
            <datalist id="masters-datalist">
              {suggestions.masters.map((m, i) => (
                <option key={i} value={m} />
              ))}
            </datalist>
            {suggestions.masters.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-semibold">सुझाव (Suggestions):</span>
                {suggestions.masters.slice(0, 6).map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, master: sugg })}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/60 dark:hover:text-blue-200 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}
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
