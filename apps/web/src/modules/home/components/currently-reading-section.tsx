'use client';
import React from 'react';
import DashboardHeader from './dashboard-header';
import { Reading_Status, UserBook } from '@/graphql/graphql';
// import CurrentlyReadingItem from './currently-reading-item';
import { CurrentlyReadingItem } from './currently-reading-item_v1';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Plus } from 'lucide-react';
interface CurrentlyReadingSectionProps {
  currentlyReading: UserBook[];
  count: number;
}

export const CurrentlyReadingSection: React.FC<
  CurrentlyReadingSectionProps
> = ({ currentlyReading, count }) => {
  return (
    <section className='bg-white '>
      <div className=' flex justify-between'></div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {currentlyReading.map((book, idx) => (
          <CurrentlyReadingItem key={idx} userBook={book} />
        ))}

        <div className='flex h-40 items-center justify-center rounded-md border border-dashed border-gray-300 '>
          <Button
            className={`cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-black shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-beige-700 hover:bg-beige-100`}
          >
            <span className='sr-only'>Edit Shelf</span>
            <div className='flex gap-2'>
              <div className='flex items-center justify-center'>
                <Plus className={`h-4 w-4 `} />
              </div>
              Add a book
            </div>
          </Button>
        </div>
      </div>
    </section>
  );
};
export default CurrentlyReadingSection;
