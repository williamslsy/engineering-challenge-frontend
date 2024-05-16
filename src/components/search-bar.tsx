import React from 'react';
import { Input } from './ui/input';
import Image from 'next/image';

export default function SearchBar() {
  return (
    <main>
      <form className="relative mb-6 w-full">
        <Input
          id="search"
          className="w-full h-12 pl-10 pr-3 py-2 rounded-lg bg-default focus:outline-none text-xl font-light"
          placeholder="Type a search query to filter"
          type="search"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 left-0 flex items-center p-3 pointer-events-none">
          <Image src="/assets/searchIcon.svg" alt="search" width={5} height={5} className="w-5 h-5" />
        </div>
      </form>
    </main>
  );
}
