'use server';

import { updateInvoice as updateInvoiceQuery } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

export async function updateInvoice(
  id: string,
  data: {
    invoiceNumber?: string;
    customerName?: string;
    vendorName?: string;
    amount?: number;
    invoiceDate?: Date;
    dueDate?: Date;
    fileUrl?: string;
  }
) {
  const result = await updateInvoiceQuery(id, data);
  
  if (result.success) {
    revalidatePath('/invoices');
  }
  
  return result;
} 