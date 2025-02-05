'use client';
import { Progress_Type, Size, UserBook } from '@/graphql/graphql';
import React from 'react';
import useUserBookStore from '@/stores/use-user-book-store';
import BookCover from '@/components/book-cover';
import { getCoverUrl, formatAuthors } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import useProgressModal from '@/components/modals/progress-modal.tsx/use-progress-modal';
import { Pencil } from 'lucide-react';
import { IconButton } from '@/modules/bookshelves/components/icon-button';
import Link from 'next/link';

interface CurrentlyReadingItemProps {
  userBook: UserBook;
}

const convertPercentProgressToPages = (
  percentProgress: number,
  capacity: number
) => {
  return Math.round((percentProgress / 100) * capacity);
};

const covertPageProgressToPercent = (
  pageProgress: number,
  capacity: number
) => {
  return Math.round((pageProgress / capacity) * 100);
};

export const CurrentlyReadingItem: React.FC<CurrentlyReadingItemProps> = ({
  userBook,
}) => {
  const { onOpen, readDates } = useProgressModal();
  const { setUserBook } = useUserBookStore();
  const readDate = readDates.find((rd) => rd.userBookId === userBook.id);
  const type = readDate?.readingProgress?.type;
  const capacity = readDate?.readingProgress?.capacity;

  const percentProgress =
    type == Progress_Type.Percentage
      ? readDate?.readingProgress?.progress
      : covertPageProgressToPercent(
          readDate?.readingProgress?.progress || 0,
          capacity || 0
        );

  const pageProgress =
    type == Progress_Type.Pages
      ? readDate?.readingProgress?.progress
      : convertPercentProgressToPages(
          readDate?.readingProgress?.progress || 0,
          capacity || 0
        );

  const { book } = userBook;
  return (
    <div className='border-grey-200 flex cursor-pointer flex-row gap-4 rounded-md border bg-white p-4 transition duration-300'>
      <div className='w-20 flex-shrink-0 overflow-hidden rounded-md shadow-sm'>
        <BookCover src={getCoverUrl(book, Size.Small)} size={'sm'} />
      </div>
      <div className='flex w-full flex-col justify-between'>
        <div className='flex w-full flex-col gap-1'>
          <div className='line-clamp-2 overflow-hidden text-base font-medium text-stone-700'>
            {book.title}
          </div>
          <div className='line-clamp-1 overflow-hidden text-xs text-gray-400'>
            by {formatAuthors(book.authors!)}
          </div>
        </div>

        <div className='mt-1 flex flex-col'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex w-[100%] flex-col'>
              <div className='mb-1 flex justify-between text-xs font-medium text-beige-700'>
                <div className='text-gray-400'>
                  {pageProgress} / {readDate?.readingProgress?.capacity} pages
                </div>
                <div className=''> {percentProgress || 0}%</div>
              </div>
              <Progress className='align-middle' value={percentProgress || 0} />
            </div>
            <div className='flex justify-end'>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the Link from being triggered
                  if (readDate?.readingProgress) {
                    onOpen();
                    setUserBook({
                      userBookId: userBook.id,
                      bookTitle: book.title,
                    });
                  }
                }}
                className={`h-8 w-8 rounded-sm bg-white`}
              >
                <span className='sr-only'>Edit Progress</span>
                <Pencil className={`h-4 w-4 items-center`} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentlyReadingItem;
