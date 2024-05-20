/**
 * Functions for handling server interactions, including saving spreadsheet data
 * and checking the processing status of a save operation.
 */

import { CellValues } from './types';
import { convertToCSV } from './utils';
import { toast } from '@/components/ui/use-toast';

enum Status {
  DONE = 'DONE',
  IN_PROGRESS = 'IN_PROGRESS',
}

interface POSTResponse {
  id?: string;
  status?: Status;
  done_at?: string;
}

interface GET {
  id?: string;
  status: Status;
  done_at?: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Recursively checks the processing status of a save operation.
 * Uses exponential backoff for retries.
 * @param id - The ID of the save operation.
 * @param retryCount - The current retry count.
 * @returns The status of the save operation.
 */

const checkProcessingStatus = async (id: string, retryCount = 0): Promise<Status> => {
  try {
    const response = await fetch(`http://localhost:8082/get-status?id=${id}`);
    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }
    const data: GET = await response.json();

    if (data.status === Status.DONE) {
      toast({
        title: 'Success',
        description: 'Spreadsheet saved successfully!',
        variant: 'success',
      });
      return Status.DONE;
    } else if (data.status === Status.IN_PROGRESS) {
      toast({
        title: 'Info',
        description: 'Save in progress. Please wait...',
        variant: 'info',
      });
      await delay(5000 * 2 ** retryCount);
      return checkProcessingStatus(id, retryCount + 1);
    }

    throw new Error('Unexpected status');
  } catch (error: any) {
    console.error('Error checking processing status:', error);
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
    throw error;
  }
};

const saveSpreadsheetData = async (cellValues: CellValues, rows: number, columns: number): Promise<Status> => {
  const csvData = convertToCSV(cellValues, rows, columns);
  console.log('Saving data:', csvData);

  try {
    const response = await fetch(`http://localhost:8082/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: csvData }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data: POSTResponse = await response.json();
    console.log('Server response:', data);

    if (data.status === Status.DONE) {
      toast({
        title: 'Success',
        description: 'Spreadsheet saved successfully!',
        variant: 'success',
      });
      return Status.DONE;
    } else if (data.status === Status.IN_PROGRESS && data.id) {
      toast({
        title: 'Info',
        description: 'Save in progress. Please wait...',
        variant: 'info',
      });
      return checkProcessingStatus(data.id);
    }

    throw new Error('Unexpected status');
  } catch (error: any) {
    console.error('Error saving spreadsheet data:', error);
    toast({
      title: 'Error',
      description: `${error.message} while saving data. Please retry.`,
      variant: 'destructive',
    });
    throw error;
  }
};

export { checkProcessingStatus, saveSpreadsheetData, Status };
