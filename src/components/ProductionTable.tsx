import React from 'react';
import { 
  CheckCircle2, AlertCircle, ChevronRight, Trash2, 
  Layers, PackageCheck, AlertOctagon, Sparkles, Clock, Edit3
} from 'lucide-react';
import { LotRow, ModalType } from '../types';
import { calculateJamaPieces } from '../utils/lotHelper';

interface ProductionTableProps {
  lots: LotRow[];
  onOpenModal: (modal: ModalType) => void;
  onUpdateLotNo: (lotId: string, newLotNo: string) => void;
  onDeleteLot: (lotId: string) => void;
  searchQuery: string;
}

export const ProductionTable: React.FC<ProductionTableProps> = ({
  lots,
  onOpenModal,
  onUpdateLotNo,
  onDeleteLot,
  searchQuery,
}) => {
  // Filter lots based on search query (by Lot No, Master, Fabric, Size, Worker name)
  const filteredLots = lots.filter((lot) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchLot = lot.lotNo.toLowerCase().includes(q);
    const matchMaster = lot.pieceDetails.master?.toLowerCase().includes(q);
    const matchFabric = lot.pieceDetails.fabric?.toLowerCase().includes(q);
    const matchSize = lot.pieceDetails.size?.toLowerCase().includes(q);
    const matchEmbroidery = lot.embroidery?.name?.toLowerCase().includes(q);
    const matchFabrication = lot.fabrication?.name?.toLowerCase().includes(q);
    const matchTanki = lot.tanki?.name?.toLowerCase().includes(q);
    const matchWashing = lot.washing?.name?.toLowerCase().includes(q);
    const matchDamage = lot.damage?.name?.toLowerCase().includes(q);
    const matchPrint = lot.print?.name?.toLowerCase().includes(q);
    const matchPacking = lot.packing?.lines?.some(l => l.name?.toLowerCase().includes(q));

    return (
      matchLot ||
      matchMaster ||
      matchFabric ||
      matchSize ||
      matchEmbroidery ||
      matchFabrication ||
      matchTanki ||
      matchWashing ||
      matchDamage ||
      matchPrint ||
      matchPacking
    );
  });

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Table Container with Horizontal and Vertical Scrolling */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] min-h-[420px]">
        <table className="w-full border-collapse text-left text-sm min-w-[1550px]">
          {/* Header */}
          <thead className="sticky top-0 z-20 bg-zinc-900 text-zinc-100 shadow-md">
            <tr className="border-b border-zinc-800 text-xs font-bold uppercase tracking-wider divide-x divide-zinc-800">
              {/* 1. Lot no */}
              <th className="py-3.5 px-4 sticky left-0 z-30 bg-zinc-950 text-amber-400 w-28 text-center shadow-xs">
                Lot no<br />
                <span className="text-[10px] text-zinc-400 font-normal">लॉट नं</span>
              </th>

              {/* 2. peice */}
              <th className="py-3.5 px-3.5 text-center bg-blue-950/70 text-blue-200 w-28">
                peice<br />
                <span className="text-[10px] text-blue-300/80 font-normal">पीस (Click)</span>
              </th>

              {/* 3. size */}
              <th className="py-3.5 px-3 text-center w-28">
                size<br />
                <span className="text-[10px] text-zinc-400 font-normal">साइज़</span>
              </th>

              {/* 4. fabric */}
              <th className="py-3.5 px-3 text-center w-36">
                fabric<br />
                <span className="text-[10px] text-zinc-400 font-normal">कपड़ा</span>
              </th>

              {/* 5. Master */}
              <th className="py-3.5 px-3 text-center w-32">
                Master<br />
                <span className="text-[10px] text-zinc-400 font-normal">मास्टर</span>
              </th>

              {/* 6. Embroidery */}
              <th className="py-3.5 px-3 text-center bg-amber-950/40 text-amber-200 w-36">
                Embroidery<br />
                <span className="text-[10px] text-amber-300/80 font-normal">कढ़ाई</span>
              </th>

              {/* 7. Fabrication */}
              <th className="py-3.5 px-3 text-center bg-indigo-950/40 text-indigo-200 w-36">
                Fabrication<br />
                <span className="text-[10px] text-indigo-300/80 font-normal">सिलाई</span>
              </th>

              {/* 8. Tanki */}
              <th className="py-3.5 px-3 text-center bg-teal-950/40 text-teal-200 w-32">
                Tanki<br />
                <span className="text-[10px] text-teal-300/80 font-normal">टांकी</span>
              </th>

              {/* 9. washing */}
              <th className="py-3.5 px-3 text-center bg-sky-950/40 text-sky-200 w-36">
                washing<br />
                <span className="text-[10px] text-sky-300/80 font-normal">वाशिंग</span>
              </th>

              {/* 10. packing */}
              <th className="py-3.5 px-3 text-center bg-emerald-950/50 text-emerald-200 w-40">
                packing<br />
                <span className="text-[10px] text-emerald-300/80 font-normal">पैकिंग (4 Lines)</span>
              </th>

              {/* 11. Jama */}
              <th className="py-3.5 px-3 text-center bg-emerald-900 text-white w-28">
                Jama<br />
                <span className="text-[10px] text-emerald-200 font-normal">जमा (कुल पैक)</span>
              </th>

              {/* 12. Leser */}
              <th className="py-3.5 px-3 text-center bg-rose-950/40 text-rose-200 w-32">
                Leser<br />
                <span className="text-[10px] text-rose-300/80 font-normal">लेज़र</span>
              </th>

              {/* 13. Print */}
              <th className="py-3.5 px-3 text-center bg-purple-950/40 text-purple-200 w-32">
                Print<br />
                <span className="text-[10px] text-purple-300/80 font-normal">प्रिंट</span>
              </th>

              {/* Action */}
              <th className="py-3.5 px-2 text-center w-16 text-zinc-400">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
            {filteredLots.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-16 text-center text-zinc-500">
                  <Layers className="w-10 h-10 mx-auto text-zinc-400 mb-2 stroke-1" />
                  <p className="text-base font-semibold">कोई लॉट रिकॉर्ड नहीं मिला</p>
                  <p className="text-xs text-zinc-400">नया लॉट जोड़ने के लिए "+ नया लॉट जोड़ें (Add Row)" बटन पर क्लिक करें।</p>
                </td>
              </tr>
            ) : (
              filteredLots.map((lot, idx) => {
                const jamaPieces = calculateJamaPieces(lot.packing);
                const cuttingPieces = typeof lot.pieceDetails.peice === 'number' ? lot.pieceDetails.peice : 0;
                const isComplete = cuttingPieces > 0 && jamaPieces >= cuttingPieces;

                // Packing display name: pick non-empty packer names or fallback
                const packingNames = (lot.packing?.lines || [])
                  .map(l => l.name?.trim())
                  .filter(Boolean);
                const uniquePackerNames = Array.from(new Set(packingNames)).join(', ');

                return (
                  <tr 
                    key={lot.id} 
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 divide-x divide-zinc-200 dark:divide-zinc-800 transition-colors group"
                  >
                    {/* 1. Lot no: Bold letters, sticky left, manually editable */}
                    <td className="py-3 px-3 sticky left-0 z-10 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/80 text-center shadow-xs">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="text"
                          value={lot.lotNo}
                          onChange={(e) => onUpdateLotNo(lot.id, e.target.value)}
                          className="w-20 text-center font-extrabold text-base tracking-wide text-zinc-900 dark:text-zinc-50 bg-transparent border-b border-transparent hover:border-amber-400 focus:border-amber-500 focus:outline-hidden transition-all"
                          title="Lot No को सीधे बदल सकते हैं (Editable)"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        #{idx + 1}
                      </span>
                    </td>

                    {/* 2. peice: Clickable cell to open PieceModal */}
                    <td 
                      onClick={() => onOpenModal({ type: 'piece', lotId: lot.id })}
                      className="py-2.5 px-3 text-center cursor-pointer hover:bg-blue-50/70 dark:hover:bg-blue-950/30 transition-all group/cell"
                      title="पीस, साइज़, कपड़ा और मास्टर विवरण भरने के लिए क्लिक करें"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-extrabold text-blue-700 dark:text-blue-300 text-base group-hover/cell:scale-105 transition-transform">
                          {lot.pieceDetails.peice !== '' ? `${lot.pieceDetails.peice}` : '—'}
                        </span>
                        {lot.pieceDetails.date && (
                          <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {lot.pieceDetails.date}
                          </span>
                        )}
                        {lot.pieceDetails.peice === '' && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                            <Edit3 className="w-2.5 h-2.5" /> दर्ज करें
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. size */}
                    <td 
                      onClick={() => onOpenModal({ type: 'piece', lotId: lot.id })}
                      className="py-2.5 px-3 text-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="बदलने के लिए क्लिक करें"
                    >
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                        {lot.pieceDetails.size || '—'}
                      </span>
                    </td>

                    {/* 4. fabric */}
                    <td 
                      onClick={() => onOpenModal({ type: 'piece', lotId: lot.id })}
                      className="py-2.5 px-3 text-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="बदलने के लिए क्लिक करें"
                    >
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 text-xs line-clamp-2">
                        {lot.pieceDetails.fabric || '—'}
                      </span>
                    </td>

                    {/* 5. Master */}
                    <td 
                      onClick={() => onOpenModal({ type: 'piece', lotId: lot.id })}
                      className="py-2.5 px-3 text-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="बदलने के लिए क्लिक करें"
                    >
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                        {lot.pieceDetails.master || '—'}
                      </span>
                    </td>

                    {/* 6. Embroidery */}
                    <td 
                      onClick={() => onOpenModal({ type: 'embroidery', lotId: lot.id })}
                      className={`py-2.5 px-3 text-center cursor-pointer transition-all ${
                        lot.embroidery?.paymentDone
                          ? 'bg-[#22c55e] text-white shadow-xs font-bold ring-1 ring-inset ring-green-600/40 hover:bg-[#16a34a]'
                          : 'hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
                      }`}
                      title="Embroidery बॉक्स खोलने के लिए क्लिक करें"
                    >
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        <div className="flex items-center gap-1 font-bold text-xs truncate max-w-[130px]">
                          {lot.embroidery?.paymentDone && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 fill-green-700" />}
                          <span className={lot.embroidery?.paymentDone ? 'text-white font-black drop-shadow-xs' : 'text-zinc-900 dark:text-zinc-100'}>
                            {lot.embroidery?.name || '—'}
                          </span>
                        </div>
                        <span className={
                          lot.embroidery?.paymentDone 
                            ? 'text-xs font-black text-white bg-green-700/60 px-2 py-0.5 rounded-full shadow-inner inline-block mt-0.5' 
                            : 'text-[11px] font-bold text-zinc-600 dark:text-zinc-400'
                        }>
                          {lot.embroidery?.peice !== '' ? `${lot.embroidery?.peice} पीस` : '—'}
                        </span>
                        {lot.embroidery?.rate !== '' && (
                          <span className={lot.embroidery?.paymentDone ? 'text-[10px] text-green-100 font-semibold' : 'text-[10px] text-zinc-400'}>
                            @₹{lot.embroidery?.rate}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 7. Fabrication */}
                    <td 
                      onClick={() => onOpenModal({ type: 'fabrication', lotId: lot.id })}
                      className={`py-2.5 px-3 text-center cursor-pointer transition-all ${
                        lot.fabrication?.paymentDone
                          ? 'bg-[#22c55e] text-white shadow-xs font-bold ring-1 ring-inset ring-green-600/40 hover:bg-[#16a34a]'
                          : 'hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20'
                      }`}
                      title="Fabrication बॉक्स खोलने के लिए क्लिक करें"
                    >
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        <div className="flex items-center gap-1 font-bold text-xs truncate max-w-[130px]">
                          {lot.fabrication?.paymentDone && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 fill-green-700" />}
                          <span className={lot.fabrication?.paymentDone ? 'text-white font-black drop-shadow-xs' : 'text-zinc-900 dark:text-zinc-100'}>
                            {lot.fabrication?.name || '—'}
                          </span>
                        </div>
                        <span className={
                          lot.fabrication?.paymentDone 
                            ? 'text-xs font-black text-white bg-green-700/60 px-2 py-0.5 rounded-full shadow-inner inline-block mt-0.5' 
                            : 'text-[11px] font-bold text-zinc-600 dark:text-zinc-400'
                        }>
                          {lot.fabrication?.peice !== '' ? `${lot.fabrication?.peice} पीस` : '—'}
                        </span>
                        {lot.fabrication?.rate !== '' && (
                          <span className={lot.fabrication?.paymentDone ? 'text-[10px] text-green-100 font-semibold' : 'text-[10px] text-zinc-400'}>
                            @₹{lot.fabrication?.rate}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 8. Tanki */}
                    <td 
                      onClick={() => onOpenModal({ type: 'tanki', lotId: lot.id })}
                      className={`py-2.5 px-3 text-center cursor-pointer transition-all ${
                        lot.tanki?.paymentDone
                          ? 'bg-[#22c55e] text-white shadow-xs font-bold ring-1 ring-inset ring-green-600/40 hover:bg-[#16a34a]'
                          : 'hover:bg-teal-50/60 dark:hover:bg-teal-950/20'
                      }`}
                      title="Tanki बॉक्स खोलने के लिए क्लिक करें"
                    >
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        <div className="flex items-center gap-1 font-bold text-xs truncate max-w-[120px]">
                          {lot.tanki?.paymentDone && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 fill-green-700" />}
                          <span className={lot.tanki?.paymentDone ? 'text-white font-black drop-shadow-xs' : 'text-zinc-900 dark:text-zinc-100'}>
                            {lot.tanki?.name || '—'}
                          </span>
                        </div>
                        <span className={
                          lot.tanki?.paymentDone 
                            ? 'text-xs font-black text-white bg-green-700/60 px-2 py-0.5 rounded-full shadow-inner inline-block mt-0.5' 
                            : 'text-[11px] font-bold text-zinc-600 dark:text-zinc-400'
                        }>
                          {lot.tanki?.peice !== '' ? `${lot.tanki?.peice} पीस` : '—'}
                        </span>
                        {lot.tanki?.rate !== '' && (
                          <span className={lot.tanki?.paymentDone ? 'text-[10px] text-green-100 font-semibold' : 'text-[10px] text-zinc-400'}>
                            @₹{lot.tanki?.rate}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 9. washing */}
                    <td 
                      onClick={() => onOpenModal({ type: 'washing', lotId: lot.id })}
                      className={`py-2.5 px-3 text-center cursor-pointer transition-all ${
                        lot.washing?.paymentDone
                          ? 'bg-[#22c55e] text-white shadow-xs font-bold ring-1 ring-inset ring-green-600/40 hover:bg-[#16a34a]'
                          : 'hover:bg-sky-50/60 dark:hover:bg-sky-950/20'
                      }`}
                      title="Washing बॉक्स खोलने के लिए क्लिक करें"
                    >
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        <div className="flex items-center gap-1 font-bold text-xs truncate max-w-[130px]">
                          {lot.washing?.paymentDone && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 fill-green-700" />}
                          <span className={lot.washing?.paymentDone ? 'text-white font-black drop-shadow-xs' : 'text-zinc-900 dark:text-zinc-100'}>
                            {lot.washing?.name || '—'}
                          </span>
                        </div>
                        <span className={
                          lot.washing?.paymentDone 
                            ? 'text-xs font-black text-white bg-green-700/60 px-2 py-0.5 rounded-full shadow-inner inline-block mt-0.5' 
                            : 'text-[11px] font-bold text-zinc-600 dark:text-zinc-400'
                        }>
                          {lot.washing?.peice !== '' ? `${lot.washing?.peice} पीस` : '—'}
                        </span>
                        {lot.washing?.washingType && (
                          <span className={lot.washing?.paymentDone ? 'text-[10px] text-green-100 font-semibold truncate max-w-[120px]' : 'text-[10px] text-sky-600 dark:text-sky-400 truncate max-w-[120px]'}>
                            {lot.washing.washingType}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 10. packing (4 lines) */}
                    <td 
                      onClick={() => onOpenModal({ type: 'packing', lotId: lot.id })}
                      className={`py-2.5 px-3 text-center cursor-pointer transition-all ${
                        lot.packing?.paymentDone
                          ? 'bg-[#22c55e] text-white shadow-xs font-bold ring-1 ring-inset ring-green-600/40 hover:bg-[#16a34a]'
                          : 'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20'
                      }`}
                      title="Packing (4 Lines) बॉक्स खोलने के लिए क्लिक करें"
                    >
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        <div className="flex items-center gap-1 font-bold text-xs truncate max-w-[140px]">
                          {lot.packing?.paymentDone && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 fill-green-700" />}
                          <span className={lot.packing?.paymentDone ? 'text-white font-black drop-shadow-xs' : 'text-zinc-900 dark:text-zinc-100'}>
                            {uniquePackerNames || '—'}
                          </span>
                        </div>
                        <span className={
                          lot.packing?.paymentDone 
                            ? 'text-xs font-black text-white bg-green-700/60 px-2 py-0.5 rounded-full shadow-inner inline-block mt-0.5' 
                            : 'text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400'
                        }>
                          {jamaPieces > 0 ? `${jamaPieces} पीस` : '—'}
                        </span>
                        <span className={lot.packing?.paymentDone ? 'text-[10px] text-green-100 font-semibold' : 'text-[10px] text-zinc-400'}>
                          (4 लाइन्स विवरण)
                        </span>
                      </div>
                    </td>

                    {/* 11. Jama: Automatic sum of packing pieces */}
                    <td className="py-2.5 px-3 text-center bg-emerald-50/80 dark:bg-emerald-950/30">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-300 text-base">
                          {jamaPieces}
                        </span>
                        {cuttingPieces > 0 && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                            isComplete 
                              ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' 
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                          }`}>
                            {jamaPieces >= cuttingPieces ? '100% पूरा' : `${jamaPieces}/${cuttingPieces}`}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 12. Leser */}
                    <td 
                      onClick={() => onOpenModal({ type: 'damage', lotId: lot.id })}
                      className={`py-2.5 px-3 text-center cursor-pointer transition-all ${
                        lot.damage?.paymentDone
                          ? 'bg-[#22c55e] text-white shadow-xs font-bold ring-1 ring-inset ring-green-600/40 hover:bg-[#16a34a]'
                          : 'hover:bg-rose-50/60 dark:hover:bg-rose-950/20'
                      }`}
                      title="Leser बॉक्स खोलने के लिए क्लिक करें"
                    >
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        <div className="flex items-center gap-1 font-bold text-xs truncate max-w-[120px]">
                          {lot.damage?.paymentDone && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 fill-green-700" />}
                          <span className={lot.damage?.paymentDone ? 'text-white font-black drop-shadow-xs' : 'text-zinc-900 dark:text-zinc-100'}>
                            {lot.damage?.name || '—'}
                          </span>
                        </div>
                        <span className={
                          lot.damage?.paymentDone 
                            ? 'text-xs font-black text-white bg-green-700/60 px-2 py-0.5 rounded-full shadow-inner inline-block mt-0.5' 
                            : 'text-[11px] font-bold text-zinc-600 dark:text-zinc-400'
                        }>
                          {lot.damage?.peice !== '' ? `${lot.damage?.peice} पीस` : '—'}
                        </span>
                      </div>
                    </td>

                    {/* 13. Print */}
                    <td 
                      onClick={() => onOpenModal({ type: 'print', lotId: lot.id })}
                      className={`py-2.5 px-3 text-center cursor-pointer transition-all ${
                        lot.print?.paymentDone
                          ? 'bg-[#22c55e] text-white shadow-xs font-bold ring-1 ring-inset ring-green-600/40 hover:bg-[#16a34a]'
                          : 'hover:bg-purple-50/60 dark:hover:bg-purple-950/20'
                      }`}
                      title="Print बॉक्स खोलने के लिए क्लिक करें"
                    >
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        <div className="flex items-center gap-1 font-bold text-xs truncate max-w-[120px]">
                          {lot.print?.paymentDone && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 fill-green-700" />}
                          <span className={lot.print?.paymentDone ? 'text-white font-black drop-shadow-xs' : 'text-zinc-900 dark:text-zinc-100'}>
                            {lot.print?.name || '—'}
                          </span>
                        </div>
                        <span className={
                          lot.print?.paymentDone 
                            ? 'text-xs font-black text-white bg-green-700/60 px-2 py-0.5 rounded-full shadow-inner inline-block mt-0.5' 
                            : 'text-[11px] font-bold text-zinc-600 dark:text-zinc-400'
                        }>
                          {lot.print?.peice !== '' ? `${lot.print?.peice} पीस` : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Actions: Delete Row */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`क्या आप वाकई Lot #${lot.lotNo} को डिलीट करना चाहते हैं?`)) {
                            onDeleteLot(lot.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Lot हटाएं (Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2">
        <div className="flex items-center gap-3">
          <span>कुल लॉट्स: <strong>{filteredLots.length}</strong></span>
          <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold">
            <span className="w-3 h-3 rounded-full bg-[#22c55e] shadow-xs ring-2 ring-green-300"></span>
            ब्राइट ग्रीन (Bright Green) = Payment Clear (भुगतान संपन्न)
          </span>
        </div>
        <div className="text-[11px] text-zinc-400">
          💡 किसी भी सेल पर क्लिक करके उसका बॉक्स खोलें और विवरण दर्ज करें
        </div>
      </div>
    </div>
  );
};
