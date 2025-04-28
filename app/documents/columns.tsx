"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Invoice } from "@/lib/db/schema"
import { format } from "date-fns"
import { FileText } from "lucide-react"

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice Number",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "vendorName",
    header: "Vendor",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      return `$${amount.toFixed(2)}`
    },
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => {
      return format(new Date(row.getValue("invoiceDate")), "PPP")
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      return format(new Date(row.getValue("dueDate")), "PPP")
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "PPP")
    },
  },
  {
    accessorKey: "fileUrl",
    header: "File",
    cell: ({ row }) => {
      const fileUrl = row.original.fileUrl;
      if (!fileUrl) {
        return <span className="text-gray-400">No file</span>;
      }
      return (
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <FileText className="h-4 w-4" />
          <span>View</span>
        </a>
      );
    },
  },
] 