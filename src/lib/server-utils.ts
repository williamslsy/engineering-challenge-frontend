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

const checkProcessingStatus = async (id: string, retryCount = 0): Promise<Status> => {
  const response = await fetch(`http://localhost:8082/get-status?id=${id}`);
  if (!response.ok) throw new Error('Server error');
  const data: GET = await response.json();

  if (data.status === Status.DONE) {
    toast({
      title: 'Success',
      description: 'Data Saved successfully!',
      variant: 'success',
    });
    return Status.DONE;
  } else if (data.status === Status.IN_PROGRESS) {
    toast({
      title: 'Info',
      description: 'Save in progress. Please wait...',
      variant: 'info',
    });
    await delay(5000 * Math.pow(2, retryCount));
    return checkProcessingStatus(id, retryCount + 1);
  }

  throw new Error('Unexpected status');
};

const saveSpreadsheetData = async (cellValues: CellValues, rows: number, columns: number): Promise<Status> => {
  const csvData = convertToCSV(cellValues, rows, columns);
  console.log('Saving data:', csvData);
  const response = await fetch(`http://localhost:8082/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: csvData }),
  });

  if (!response.ok) {
    toast({
      title: 'Error',
      description: 'Server error while saving data. Retrying now...',
      variant: 'destructive',
    });
    throw new Error('Server error');
  }
  const data: POSTResponse = await response.json();
  console.log(data, 'actualdata');

  if (data.status === Status.DONE) {
    toast({
      title: 'Success',
      description: 'Data saved successfully!',
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
};

export { checkProcessingStatus, saveSpreadsheetData, Status };
