import { LotRow, PackingDetails, JobWorkDetails } from '../types';

/**
 * Automatically calculates the next lot number by incrementing the numeric portion of the previous lot number by 1.
 * e.g. "101" -> "102"
 * "LOT-500" -> "LOT-501"
 * "A-099" -> "A-100"
 */
export function calculateNextLotNo(lastLotNo?: string): string {
  if (!lastLotNo || typeof lastLotNo !== 'string' || !lastLotNo.trim()) {
    return '101';
  }

  const trimmed = lastLotNo.trim();
  // Match trailing digits or entire digits
  const match = trimmed.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const numberStr = match[2];
    const nextNum = parseInt(numberStr, 10) + 1;
    // preserve leading zeros if padded, e.g. "005" -> "006"
    const padded = String(nextNum).padStart(numberStr.length, '0');
    return `${prefix}${padded}`;
  }

  // If no digits found, append 1
  return `${trimmed}-1`;
}

/**
 * Calculates Jama pieces: Total pieces packed from the 4 lines in packing section
 */
export function calculateJamaPieces(packing?: PackingDetails): number {
  if (!packing || !Array.isArray(packing.lines)) return 0;
  return packing.lines.reduce((sum, line) => {
    const val = typeof line.peice === 'number' ? line.peice : parseFloat(String(line.peice)) || 0;
    return sum + val;
  }, 0);
}

/**
 * Creates a blank new lot with default empty values and incremented lot number
 */
export function createNewLot(lastLotNo?: string, createdBy: string = 'User'): LotRow {
  const nextLot = calculateNextLotNo(lastLotNo);
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  return {
    id: 'lot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    lotNo: nextLot,
    createdAt: now,
    updatedAt: now,
    updatedBy: createdBy,
    pieceDetails: {
      date: today,
      peice: '',
      size: '',
      fabric: '',
      master: '',
    },
    embroidery: {
      date: today,
      peice: '',
      rate: '',
      name: '',
      paymentDone: false,
    },
    fabrication: {
      date: today,
      peice: '',
      rate: '',
      name: '',
      paymentDone: false,
    },
    tanki: {
      date: today,
      peice: '',
      rate: '',
      name: '',
      paymentDone: false,
    },
    washing: {
      date: today,
      peice: '',
      rate: '',
      name: '',
      washingType: '',
      paymentDone: false,
    },
    packing: {
      paymentDone: false,
      lines: [
        { id: 'p1', date: today, peice: '', rate: '', ripit: '', name: '' },
        { id: 'p2', date: today, peice: '', rate: '', ripit: '', name: '' },
        { id: 'p3', date: today, peice: '', rate: '', ripit: '', name: '' },
        { id: 'p4', date: today, peice: '', rate: '', ripit: '', name: '' },
      ],
    },
    damage: {
      date: today,
      peice: '',
      name: '',
      paymentDone: false,
    },
    print: {
      date: today,
      peice: '',
      name: '',
      paymentDone: false,
    },
  };
}

/**
 * Calculates payment amount if rate & peice are provided
 */
export function calculateAmount(job: JobWorkDetails): number {
  const p = typeof job.peice === 'number' ? job.peice : parseFloat(String(job.peice)) || 0;
  const r = typeof job.rate === 'number' ? job.rate : parseFloat(String(job.rate)) || 0;
  return p * r;
}

export interface ColumnSuggestions {
  sizes: string[];
  fabrics: string[];
  masters: string[];
  embroideryNames: string[];
  fabricationNames: string[];
  tankiNames: string[];
  washingNames: string[];
  washingTypes: string[];
  packingNames: string[];
  packingRipits: string[];
  damageNames: string[]; // Leser names
  printNames: string[];
}

/**
 * Extracts unique previous entries from all lots to provide smart autocomplete and suggestions
 */
export function extractColumnSuggestions(lots: LotRow[]): ColumnSuggestions {
  const getUnique = (arr: (string | undefined | null)[]) => {
    const set = new Set<string>();
    for (const item of arr) {
      if (item && typeof item === 'string' && item.trim()) {
        set.add(item.trim());
      }
    }
    return Array.from(set);
  };

  return {
    sizes: getUnique(lots.map(l => l.pieceDetails?.size)),
    fabrics: getUnique(lots.map(l => l.pieceDetails?.fabric)),
    masters: getUnique(lots.map(l => l.pieceDetails?.master)),
    embroideryNames: getUnique(lots.map(l => l.embroidery?.name)),
    fabricationNames: getUnique(lots.map(l => l.fabrication?.name)),
    tankiNames: getUnique(lots.map(l => l.tanki?.name)),
    washingNames: getUnique(lots.map(l => l.washing?.name)),
    washingTypes: getUnique(lots.map(l => l.washing?.washingType)),
    packingNames: getUnique(lots.flatMap(l => l.packing?.lines?.map(p => p.name) || [])),
    packingRipits: getUnique(lots.flatMap(l => l.packing?.lines?.map(p => p.ripit) || [])),
    damageNames: getUnique(lots.map(l => l.damage?.name)),
    printNames: getUnique(lots.map(l => l.print?.name)),
  };
}

