import { auth } from '@/app/(auth)/auth';
import { getInvoices } from '@/lib/db/queries';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';

export default async function InvoicesPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Please sign in to view invoices</div>;
  }

  const invoices = await getInvoices();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      <DataTable 
        columns={columns} 
        data={invoices} 
        filterColumn="invoiceNumber"
        filterPlaceholder="Filter by invoice number..."
      />
    </div>
  );
} 