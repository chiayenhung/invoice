'use server';

import { generateText, generateObject, type Message, type FilePart } from 'ai';
import { cookies } from 'next/headers';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/models';
import { z } from 'zod';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  if (process.env.MOCK === 'true') {
    return 'mock title';
  }
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: message.content,
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function extractInvoiceMeta({
  data,
  type,
}: {
  data: FilePart["data"];
  type: 'text' | 'image' | 'file';
}) {
  
  if (process.env.MOCK === 'true') {
    // In a real implementation, you would use a PDF parsing library here
    // For now, we'll return a placeholder response
    return {
      invoice: {
        customerName: "Example Customer",
        vendorName: "Example Vendor",
        invoiceNumber: "INV-12345",
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        amount: 999.99,
        lineItems: [
          {
            description: "Example Item",
            quantity: 1,
            unitPrice: 999.99,
            amount: 999.99
          }
        ]
      },
      isInvoice: true
    };
  }

  // Determine which model to use based on the file type
  let modelName = 'pdf-model';
  if (type === 'text') {
    modelName = 'text-model';
  }

  let attachmentMessage = getAttachmentMessage(type, data);

  // For text content, we can process it directly
  const { object } = await generateObject({
    model: myProvider.languageModel(modelName),
    schema: z.object({
      invoice: z.object({
        customerName: z.string({description: 'invoice customer name'}),
        vendorName: z.string({description: 'invoice vendor name'}),
        invoiceNumber: z.string({description: 'invoice number'}),
        invoiceDate: z.string({description: 'invoice create date'}).transform((val) => new Date(val)),
        dueDate: z.string({description: 'invoice due date'}).transform((val) => new Date(val)),
        amount: z.number({description: 'invoice total amount'}),
        lineItems: z.array(z.object({
          description: z.string({description: 'line item description'}),
          quantity: z.number({description: 'line item quantity'}),
          unitPrice: z.number({description: 'line item unit price'}),
          amount: z.number({description: 'line item total amount'})
        }))
      }),
      isInvoice: z.boolean({description: 'is this file invoice? if not, return false. we only want to process invoice files, not other types, e.g. receipts or statements etc.'}),
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: "Process this invoice",
          },
          attachmentMessage,
        ]
      }
    ]
  });
  return object;
}

function getAttachmentMessage(type: 'image' | 'text' | 'file', data: string | FilePart["data"]) {
  let mimeType = 'application/pdf';
  if (type === 'image') {
    mimeType = 'image/jpeg';
  } else if (type === 'text') {
    mimeType = 'text/plain';
  }

  const message = {
    type,
  }

  if (type === 'file' || type === 'image') {
    message.data = data;
  }
  
  if (type === 'file') {
    message.mimeType = mimeType;
  } 

  if (type === 'text') {
    message.text = data;
  }

  return message;
}