export interface PieceDetails {
  date: string;
  peice: number | '';
  size: string;
  fabric: string;
  master: string;
}

export interface JobWorkDetails {
  date: string;
  peice: number | '';
  rate: number | '';
  name: string;
  paymentDone: boolean;
  washingType?: string; // used for Washing column
}

export interface PackingLine {
  id: string;
  date: string;
  peice: number | '';
  rate: number | '';
  ripit: string;
  name: string;
}

export interface PackingDetails {
  lines: PackingLine[];
  paymentDone: boolean;
}

export interface DamageDetails {
  date: string;
  peice: number | '';
  name: string;
  paymentDone: boolean;
}

export interface PrintDetails {
  date: string;
  peice: number | '';
  name: string;
  paymentDone: boolean;
}

export interface LotRow {
  id: string;
  lotNo: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  
  pieceDetails: PieceDetails;
  embroidery: JobWorkDetails;
  fabrication: JobWorkDetails;
  tanki: JobWorkDetails;
  washing: JobWorkDetails;
  packing: PackingDetails;
  damage: DamageDetails;
  print: PrintDetails;
}

export interface ConnectedUserInfo {
  id: string;
  userName: string;
  connectedAt: string;
}

export type ModalType = 
  | null 
  | { type: 'piece'; lotId: string }
  | { type: 'embroidery'; lotId: string }
  | { type: 'fabrication'; lotId: string }
  | { type: 'tanki'; lotId: string }
  | { type: 'washing'; lotId: string }
  | { type: 'packing'; lotId: string }
  | { type: 'damage'; lotId: string }
  | { type: 'print'; lotId: string };
