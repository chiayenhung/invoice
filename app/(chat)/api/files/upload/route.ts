import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/(auth)/auth';
import { extractInvoiceMeta } from '../../../actions';
import { saveDocument, saveInvoice, saveInvoiceLines } from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), {
      message: 'File type should be JPEG or PNG',
    }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get('file') as File).name;
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${filename}`;

      // Create data URL for immediate preview
      const dataURL = `data:${file.type};base64,${buffer.toString('base64')}`;

      // Determine file type based on MIME type
      let fileType: 'text' | 'image' | 'file' = 'file';
      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type === 'text/plain') {
        fileType = 'text';
      }

      const meta = await extractInvoiceMeta({
        type: fileType,
        data: buffer.toString('base64'),
      });

      if (!meta.isInvoice) {
        return NextResponse.json({ error: 'File is not an invoice' }, { status: 400 });
      }

      // Save document with metadata
      const documentId = generateUUID();
      await saveDocument({
        id: documentId,
        title: filename,
        kind: 'text',
        content: JSON.stringify(meta),
        userId: session.user.id,
      });

      // If the file is an invoice, save it to the invoice tables
      if (meta.isInvoice && meta.invoice) {
        const invoiceId = generateUUID();
        
        // Save the invoice
        await saveInvoice({
          id: invoiceId,
          customerName: meta.invoice.customerName,
          vendorName: meta.invoice.vendorName,
          invoiceNumber: meta.invoice.invoiceNumber,
          invoiceDate: meta.invoice.invoiceDate,
          dueDate: meta.invoice.dueDate,
          amount: meta.invoice.amount,
        });

        // Save the invoice line items
        if (meta.invoice.lineItems && meta.invoice.lineItems.length > 0) {
          const invoiceLines = meta.invoice.lineItems.map(item => ({
            id: generateUUID(),
            invoiceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          }));

          await saveInvoiceLines({ invoiceLines });
        }
      }

      return NextResponse.json({
        url: dataURL,
        pathname: `/uploads/${uniqueFilename}`,
        contentType: file.type,
        documentId,
        isInvoice: meta.isInvoice,
      });
    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
