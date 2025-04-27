"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Invoice } from "@/lib/db/schema"
import { format } from "date-fns"
import { ArrowUpDown, Check, X, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { updateInvoice } from "./actions"
import { toast } from "sonner"

// Cell editor component for text fields
const TextCellEditor = ({ value, onSave }: { value: string; onSave: (value: string) => void }) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSave(editValue);
        }
      }}
      className="w-full px-2 py-1 border rounded"
    />
  );
};

// Cell editor component for number fields
const NumberCellEditor = ({ value, onSave }: { value: number; onSave: (value: number) => void }) => {
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="number"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => {
        const numValue = parseFloat(editValue);
        if (!isNaN(numValue)) {
          onSave(numValue);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const numValue = parseFloat(editValue);
          if (!isNaN(numValue)) {
            onSave(numValue);
          }
        }
      }}
      className="w-full px-2 py-1 border rounded"
    />
  );
};

// Cell editor component for date fields
const DateCellEditor = ({ value, onSave }: { value: Date; onSave: (value: Date) => void }) => {
  const [dateValue, setDateValue] = useState<Date>(value);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDateValue(date);
      onSave(date);
    }
  };

  return (
    <DatePicker
      date={dateValue}
      setDate={handleDateChange}
    />
  );
};

// Editable cell component
const EditableCell = ({ 
  value, 
  type, 
  onSave,
  isEditMode,
  isAdmin
}: { 
  value: string | number | Date; 
  type: 'text' | 'number' | 'date'; 
  onSave: (value: any) => void;
  isEditMode: boolean;
  isAdmin: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing && isEditMode && isAdmin) {
    switch (type) {
      case 'text':
        return <TextCellEditor value={value as string} onSave={(v) => { onSave(v); setIsEditing(false); }} />;
      case 'number':
        return <NumberCellEditor value={value as number} onSave={(v) => { onSave(v); setIsEditing(false); }} />;
      case 'date':
        return <DateCellEditor value={value as Date} onSave={(v) => { onSave(v); setIsEditing(false); }} />;
      default:
        return null;
    }
  }

  return (
    <div 
      onClick={() => isEditMode && isAdmin && setIsEditing(true)}
      className={`${isEditMode && isAdmin ? 'cursor-pointer hover:bg-gray-100' : ''} p-2 rounded`}
    >
      {type === 'date' 
        ? format(value as Date, 'MMM d, yyyy')
        : value.toString()}
    </div>
  );
};

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2"
        >
          Invoice Number
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row, column }) => {
      const invoice = row.original;
      const { isEditMode, isAdmin } = column.columnDef.meta as { isEditMode: boolean; isAdmin: boolean };
      return (
        <EditableCell
          value={invoice.invoiceNumber}
          type="text"
          onSave={async (value) => {
            await updateInvoice(invoice.id, { invoiceNumber: value });
          }}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />
      );
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2"
        >
          Customer Name
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row, column }) => {
      const invoice = row.original;
      const { isEditMode, isAdmin } = column.columnDef.meta as { isEditMode: boolean; isAdmin: boolean };
      return (
        <EditableCell
          value={invoice.customerName}
          type="text"
          onSave={async (value) => {
            await updateInvoice(invoice.id, { customerName: value });
          }}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />
      );
    },
  },
  {
    accessorKey: "vendorName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2"
        >
          Vendor Name
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row, column }) => {
      const invoice = row.original;
      const { isEditMode, isAdmin } = column.columnDef.meta as { isEditMode: boolean; isAdmin: boolean };
      return (
        <EditableCell
          value={invoice.vendorName}
          type="text"
          onSave={async (value) => {
            await updateInvoice(invoice.id, { vendorName: value });
          }}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2"
        >
          Amount
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row, column }) => {
      const invoice = row.original;
      const { isEditMode, isAdmin } = column.columnDef.meta as { isEditMode: boolean; isAdmin: boolean };
      return (
        <EditableCell
          value={invoice.amount}
          type="number"
          onSave={async (value) => {
            await updateInvoice(invoice.id, { amount: value });
          }}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />
      );
    },
  },
  {
    accessorKey: "invoiceDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2"
        >
          Invoice Date
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row, column }) => {
      const invoice = row.original;
      const { isEditMode, isAdmin } = column.columnDef.meta as { isEditMode: boolean; isAdmin: boolean };
      return (
        <EditableCell
          value={invoice.invoiceDate}
          type="date"
          onSave={async (value) => {
            await updateInvoice(invoice.id, { invoiceDate: value });
          }}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2"
        >
          Due Date
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row, column }) => {
      const invoice = row.original;
      const { isEditMode, isAdmin } = column.columnDef.meta as { isEditMode: boolean; isAdmin: boolean };
      return (
        <EditableCell
          value={invoice.dueDate}
          type="date"
          onSave={async (value) => {
            await updateInvoice(invoice.id, { dueDate: value });
          }}
          isEditMode={isEditMode}
          isAdmin={isAdmin}
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2"
        >
          Created At
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return format(row.original.createdAt, 'MMM d, yyyy');
    },
  },
] 