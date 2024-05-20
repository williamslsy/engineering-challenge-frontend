'use client';

import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import useSpreadSheetContext from '@/hooks/useSpreadSheetContext';
import Image from 'next/image';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

function Spreadsheet() {
  const { cellValues, handleCellValueChange, handleBlur, handleFocus, isError, handleSave, isSaving, focusedCell, columns, rows } = useSpreadSheetContext();

  const headers = useMemo(() => Array.from({ length: columns }, (_, colIndex) => String.fromCharCode(65 + colIndex)), [columns]);

  const getPlaceholder = (header: string, rowId: string): string => {
    switch (header) {
      case 'A':
        return 'Enter a value like $1000';
      case 'B':
        return 'Enter a value like 15%';
      case 'C':
        return `Enter a formula like =A${rowId}*B${rowId}`;
      default:
        return '';
    }
  };

  return (
    <main>
      <Button onClick={handleSave} className="mb-4" disabled={isSaving}>
        {isSaving ? 'Saving Spreadsheet ...' : 'Save Spreadsheet'}
      </Button>
      <Table className="w-full border-separate border-spacing-0">
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="flex bg-defaultDarker rounded-lg mb-4 border-none">
            {headers.map((header, index) => (
              <TableHead
                key={header}
                className={cn('flex items-center text-black justify-center h-12 border-gray-300', {
                  'basis-30p4': index < headers.length - 1,
                  'basis-39p2': index === headers.length - 1,
                })}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="text-sm text-gray-900">
          {Array.from({ length: rows }, (_, rowIndex) => {
            const rowId = (rowIndex + 1).toString();
            const rowHasError = headers.some((header) => isError(`${header}${rowId}`));
            const rowIsFocused = headers.some((header) => focusedCell?.endsWith(rowId));

            return (
              <TableRow
                key={rowId}
                className={cn('flex h-12 mb-2 rounded-md bg-cell', {
                  'bg-highlight': rowIsFocused,
                  'border-red-500 bg-red-100 border': rowHasError,
                  'border-none': !rowHasError,
                })}
              >
                {headers.map((header, index) => {
                  const cell = `${header}${rowId}`;
                  const cellValue = cellValues[cell]?.value || '';

                  return (
                    <TableCell
                      key={cell}
                      className={cn('flex-1 flex items-center justify-center relative border-r overflow-hidden', {
                        'basis-30p4': index < headers.length - 1,
                        'basis-39p2': index === headers.length - 1,
                        'bg-highlight': focusedCell === cell,
                        'shadow-md': focusedCell === cell,
                        'bg-opacity-70': rowIsFocused && focusedCell !== cell,
                        'last:border-none': index === headers.length - 1,
                      })}
                      onClick={() => handleFocus(cell)}
                    >
                      <form onSubmit={(e) => e.preventDefault()} className="flex justify-between items-center h-full w-full border-none">
                        {focusedCell === cell ? (
                          <Input
                            type="text"
                            value={cellValue}
                            onChange={(e) => handleCellValueChange(cell, e.target.value)}
                            onBlur={() => handleBlur(cell)}
                            placeholder={getPlaceholder(header, rowId)}
                            className="text-center text-gray-900 w-full border-none bg-transparent"
                            autoFocus
                          />
                        ) : (
                          <div className="text-center text-gray-900 w-full truncate">{cellValue}</div>
                        )}
                        <Image
                          src="/assets/pencilIcon.svg"
                          alt="pencil"
                          width={16}
                          height={16}
                          className={cn('w-4 h-4 text-gray-500 cursor-pointer', {
                            hidden: focusedCell === cell,
                          })}
                          onClick={() => handleFocus(cell)}
                        />
                      </form>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}

export default Spreadsheet;
