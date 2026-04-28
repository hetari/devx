export type RobotState = 'idle' | 'listening' | 'understanding' | 'preview_ready' | 'saved';

export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  amount: number;
  quantity?: number;
  category: string;
  timestamp: Date;
}

export interface Insight {
  id: string;
  what_happened: string;
  why_it_matters: string;
  what_it_means: string;
  what_to_do: string;
  timestamp: Date;
}

export interface PreviewData {
  revenues: Omit<Transaction, 'id' | 'timestamp' | 'type'>[];
  expenses: Omit<Transaction, 'id' | 'timestamp' | 'type'>[];
}
