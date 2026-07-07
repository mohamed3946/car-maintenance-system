export type CashTransactionType = "cash_receive" | "wallet_deposit";

export type CashRider = {
  id: string;
  name: string;
  hungerId: string;
  phone?: string;
  walletBalance: number;
  cashReceived: number;
  walletDeposit: number;
  remaining: number;
};

export type CashTransaction = {
  id: string;
  employeeId: string;
  riderName?: string;
  transactionType: CashTransactionType;
  amount: number;
  notes?: string | null;
  createdAt: string;
};

export type WalletReport = {
  id: string;
  reportDate: string;
  fileName: string | null;
  uploadedRows: number;
  matchedRows: number;
  uploadedBy?: string | null;
  createdAt: string;
};