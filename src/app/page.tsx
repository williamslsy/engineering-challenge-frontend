import HeaderText from '@/components/header-text';
import SearchBar from '@/components/search-bar';
import Spreadsheet from '@/components/spreadsheet/spreadsheet';
import SpreadSheetProvider from '@/context/SpreadSheetContext';
import { Suspense } from 'react';
import Loading from './loading';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 w-full">
      <div className="w-full max-w-[886px] px-4 md:px-6 lg:px-8 xl:px-10 bg-white rounded-lg my-4 md:my-6 lg:my-8 xl:my-10">
        <HeaderText />
        <SearchBar />
        <SpreadSheetProvider rows={25} columns={3}>
          <Suspense fallback={<Loading />}>
            <Spreadsheet />
          </Suspense>
        </SpreadSheetProvider>
      </div>
    </div>
  );
}
