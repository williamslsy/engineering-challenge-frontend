'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import useSpreadSheetContext from '@/hooks/useSpreadSheetContext';
import Image from 'next/image';

function Spreadsheet() {
  const { cellValues, handleCellValueChange, handleBlur, handleFocus, focusedCell, columns, rows } = useSpreadSheetContext();
  const headers = Array.from({ length: columns }, (_, colIndex) => String.fromCharCode(65 + colIndex));

  return (
    <Table className="w-full border-separate border-spacing-0">
      <TableHeader className="sticky top-0 z-10 bg-gray-200">
        <TableRow className="flex text-sm text-center font-medium text-gray-700">
          {headers.map((header) => (
            <TableHead key={header} className="flex-1 flex items-center justify-center h-12 bg-gray-200 border-b border-gray-300">
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="text-sm text-gray-800">
        {[...Array(rows)].map((_, rowIndex) => {
          const rowId = (rowIndex + 1).toString();
          return (
            <TableRow key={rowId} className="flex bg-white hover:bg-gray-50 h-12 border-b border-gray-200">
              {headers.map((header) => {
                const cell = `${header}${rowId}`;
                const cellValue = cellValues[cell]?.value || '';

                return (
                  <TableCell key={cell} className="flex-1 flex items-center justify-center relative px-3 border-r border-gray-300">
                    <form onSubmit={(e) => e.preventDefault()} className="flex justify-between items-center h-full w-full">
                      {focusedCell === cell ? (
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => handleCellValueChange(cell, e.target.value)}
                          onBlur={() => handleBlur(cell)}
                          onFocus={() => handleFocus(cell)}
                          className="text-center text-gray-900 w-full"
                        />
                      ) : (
                        <div className="text-center text-gray-900">{cellValue}</div>
                      )}
                      <Image src="/assets/pencilIcon.svg" alt="pencil" width={4} height={4} className="w-4 h-4 text-gray-500 cursor-pointer" onClick={() => handleFocus(cell)} />
                    </form>
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default Spreadsheet;
