import { auth } from '@/app/(auth)/auth';
import { getDocuments } from '@/lib/db/queries';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Please sign in to view documents</div>;
  }

  const documents = await getDocuments();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Documents</h1>
      <DataTable columns={columns} data={documents} />
    </div>
  );
} 