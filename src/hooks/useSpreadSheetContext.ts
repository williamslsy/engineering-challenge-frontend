import { useContext } from 'react';
import { SpreadSheetContext } from '@/context/SpreadSheetContext';

const useSpreadSheetContext = () => {
  const context = useContext(SpreadSheetContext);
  if (!context) {
    throw new Error('useSpreadSheetContext must be used within a SpreadSheetProvider');
  }
  return context;
};

export default useSpreadSheetContext;
