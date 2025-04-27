import { auth } from '@/app/(auth)/auth';
import { getInvoices } from '@/lib/db/queries';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import type { User } from '@/app/(auth)/auth';

export default async function InvoicesPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Please sign in to view invoices</div>;
  }

  const invoices = await getInvoices();
  const isAdmin = (session.user as User).role === 'admin';

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            id="edit-mode-toggle"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Mode</span>
          </Button>
        )}
      </div>
      <DataTable 
        columns={columns} 
        data={invoices} 
        filterColumn="invoiceNumber"
        filterPlaceholder="Filter by invoice number..."
        defaultSort={[{ id: 'invoiceDate', desc: true }]}
        isAdmin={isAdmin}
      />
    </div>
  );
} 