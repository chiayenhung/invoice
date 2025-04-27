"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Invoice } from "@/lib/db/schema"
import { format } from "date-fns"

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
] 