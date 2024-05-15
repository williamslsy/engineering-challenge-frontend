import HeaderText from '@/components/header-text';
import SearchBar from '@/components/search-bar';
import Spreadsheet from '@/components/spreadsheet';
import SpreadSheetProvider from '@/context/SpreadSheetContext';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-10 w-full">
      <div className="w-full max-w-7xl px-4 md:px-6 lg:px-8 xl:px-10 bg-white rounded-lg shadow-md my-4 md:my-6 lg:my-8 xl:my-10">
        <HeaderText />
        <SearchBar />
        <SpreadSheetProvider rows={50} columns={3}>
          <Spreadsheet />
        </SpreadSheetProvider>
      </div>
    </div>
  );
}
