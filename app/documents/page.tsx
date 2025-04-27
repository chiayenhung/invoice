import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { document } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Please sign in to view documents</div>;
  }

  const documents = await db
    .select()
    .from(document)
    .orderBy(desc(document.createdAt));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Documents</h1>
      <DataTable columns={columns} data={documents} />
    </div>
  );
} 