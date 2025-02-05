// HomeTemplate.tsx
import React from 'react';
import {
  BookCountsResponse,
  Reading_Status,
  Shelf,
  UserBook,
} from '@/graphql/graphql';
import CurrentlyReadingSection from '../components/currently-reading-section';
import ReadingOverview from '../components/reading-overview';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedWave from '../components/animated-wave';
import StatusBooksCard from '../components/status-books-card';
import { readingStatuses } from '@/config/books';

interface HomeTemplateProps {
  currentlyReading: UserBook[];
  wantToRead: UserBook[];
  shelves: Shelf[];
  username: string;
  upNext: UserBook[];
  bookCounts: BookCountsResponse;
}

export default function HomeTemplate({
  currentlyReading,
  wantToRead,
  username,
  bookCounts,
  upNext,
}: HomeTemplateProps) {
  return (
    <main className='py-8'>
      <div className='grid grid-cols-1 items-start gap-4 xl:grid-cols-16 xl:gap-8'>
        <div className='grid grid-cols-1 gap-4 xl:col-span-11'>
          <section aria-labelledby='section-1-title' className='mb-4'>
            <div id='section-1-title'>
              <div className='ml-1 overflow-hidden rounded-lg text-beige-700'>
                <div className='text-4xl font-bold'>
                  Welcome back, {username}
                  <AnimatedWave />
                </div>
                <span className='mt-1 text-xl text-gray-400'>
                  Here's what you've been reading
                </span>
              </div>
            </div>
          </section>
          <ReadingOverview bookCounts={bookCounts} />
          <CurrentlyReadingSection
            count={bookCounts.readingCount}
            currentlyReading={currentlyReading}
          />
        </div>
        <div className='grid grid-cols-1 gap-4 xl:col-span-5'>
          <section aria-labelledby='section-2-title'>
            <div className='overflow-hidden rounded-lg'>
              <div className='py-4 shadow-md'>
                <div className='space-y-4'>
                  <StatusBooksCard
                    title={'Up Next'}
                    upNext={upNext}
                    count={bookCounts.upNextCount}
                    status={Reading_Status.UpNext}
                  />
                  <StatusBooksCard
                    title={'Want to Read'}
                    upNext={wantToRead}
                    count={bookCounts.wantsToReadCount}
                    status={Reading_Status.WantToRead}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
