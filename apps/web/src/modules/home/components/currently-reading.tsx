'use client';
import { Size, UserBook } from '@/graphql/graphql';
import React, { useState } from 'react';
import useLogBookModal from '@/components/modals/log-book-modal/use-log-book-modal';
import { useJournalEntryModal } from '@/components/modals/journal-entry-modal/use-journal-entry-modal';
import useUserBookStore from '@/stores/use-user-book-store';
import BookCover from '@/components/book-cover';
import { dm_sefif_display } from '@/lib/fonts';
import { getCoverUrl, cn, formatAuthors } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CurrentlyReadingProps {
  userBook: UserBook;
}

export const CurrentlyReading: React.FC<CurrentlyReadingProps> = ({
  userBook,
}) => {
  const logBookModal = useLogBookModal();
  const journalEntryModal = useJournalEntryModal();
  const { updateBookId, updateStatus, setBook, initShelves } =
    useUserBookStore();
  const [status, setStatus] = useState(userBook.status ? userBook.status : '');
  if (!userBook) return null;
  const { book, shelves } = userBook;
  return (
    <div className='flex justify-between'>
      <div className='flex gap-4 border-gray-100 p-2'>
        <div className='flex flex-col gap-1'>
          <div className='flex gap-4'>
            <BookCover src={getCoverUrl(book, Size.Small)} size={'xxs'} />
            <div className='space-y-1'>
              <h2
                className={cn(
                  dm_sefif_display.className,
                  'text-xl leading-5 text-beige'
                )}
              >
                {book.title}
              </h2>
              <div className='flex items-center gap-2'>
                <p className='text-sm text-gray-400'>
                  by {formatAuthors(book!)}
                </p>
                <div className='flex items-center'></div>
              </div>
            </div>
          </div>

          <div className='flex items-center font-medium'>
            <span className='text-sm text-gray-700'></span>
          </div>
        </div>
      </div>
      <div className='flex justify-end gap-4 p-2'>
        <div>
          <div className='flex min-w-[19em] flex-col gap-[-2px] px-2 text-sm'>
            <div className='flex min-w-36 items-center justify-center gap-2 text-center text-beige'>
              <Progress className='items-center' value={23} />
              <div className='flex items-center gap-0.5'>{23}%</div>
            </div>
            <div className='flex w-max items-center text-xs font-medium text-gray-500'>
              <div>
                {100} / {223} pages read
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-end'>
          <Button
            variant={'secondary'}
            onClick={(e) => {
              e.stopPropagation();
              setBook(book!);
              updateStatus(status);
              updateBookId(book!.id);
              journalEntryModal.onOpen();
            }}
          >
            Update Progress
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CurrentlyReading;
