export interface ImportRow {
  rowIndex: number;
  date: string;
  description: string;
  amount: number;
  fitId?: string;
  duplicate: boolean;
  suggestedCategory?: string;
}

export interface ImportPreview {
  importLogId: string;
  fileName: string;
  fileType: string;
  accountId: string;
  accountName: string;
  totalRows: number;
  duplicateCount: number;
  rows: ImportRow[];
}

export interface ImportConfirmRequest {
  importLogId: string;
  skipDuplicates: boolean;
  categoryOverrides?: Record<number, string>;
}

export interface ImportLog {
  id: string;
  fileName: string;
  fileType: string;
  accountId: string;
  accountName: string;
  status: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  errorDetails?: string;
  createdAt: string;
}

export interface ImportHistory {
  imports: ImportLog[];
  totalImported: number;
  totalDuplicates: number;
}