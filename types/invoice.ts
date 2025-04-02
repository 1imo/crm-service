export interface Invoice {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'void';
  dueDate: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productId?: string;
} 