"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Document } from "@/lib/db/schema"
import { format } from "date-fns"

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "kind",
    header: "Type",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "PPP")
    },
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => {
      const content = row.getValue("content") as string
      return content ? content.substring(0, 100) + "..." : "-"
    },
  },
] 