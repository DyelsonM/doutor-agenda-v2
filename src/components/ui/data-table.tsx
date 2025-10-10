"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchKeys?: string[];
  searchPlaceholder?: string;
  maxHeight?: string;
}

// Otimização: Memoizar componente para evitar re-renders desnecessários
function DataTableComponent<TData, TValue>({
  columns,
  data,
  searchKey,
  searchKeys,
  searchPlaceholder = "Pesquisar...",
  maxHeight = "600px",
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Garantir que o componente só renderize no cliente para evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;

      // Função auxiliar para obter valor de campo aninhado
      const getNestedValue = (obj: any, keyPath: string) => {
        const keys = keyPath.split(".");
        let value = obj;

        for (const key of keys) {
          value = value?.[key];
          if (value === undefined || value === null) return null;
        }

        return value;
      };

      // Se searchKeys for fornecido, pesquisar em todos os campos
      const keysToSearch = searchKeys || (searchKey ? [searchKey] : []);

      if (keysToSearch.length === 0) return true;

      // Verificar se o valor de pesquisa está presente em qualquer um dos campos
      return keysToSearch.some((key) => {
        const cellValue = getNestedValue(row.original, key);
        if (typeof cellValue !== "string") return false;

        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });
    },
    state: {
      globalFilter,
    },
  });

  // Não renderizar até que esteja no cliente
  if (!isClient) {
    return (
      <div className="space-y-4">
        {(searchKey || searchKeys) && (
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder}
              value=""
              disabled
              className="pl-10"
            />
          </div>
        )}
        <div className="rounded-md border">
          <div className="overflow-y-auto" style={{ maxHeight }}>
            <Table>
              <TableHeader className="bg-background sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de pesquisa */}
      {(searchKey || searchKeys) && (
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-md border">
        <div className="overflow-y-auto" style={{ maxHeight }}>
          <Table>
            <TableHeader className="bg-background sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows && table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// Exportar versão memoizada para melhor performance
export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
