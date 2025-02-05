'use client';
import React, { useCallback, useTransition, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Shelf } from '@/graphql/graphql';
import EditShelfMenu from './edit-shelf-menu';
import useCreateQueryString from '../../bookshelves/hooks/use-create-query-string';
import useShelfStore from '@/stores/use-shelf-store';
import { Icons } from '@/components/icons';

interface ShelfItemProps {
  shelf: Shelf;
  isShelves?: boolean;
  setOpenAlert?: React.Dispatch<React.SetStateAction<boolean>>;
  padding?: string;
}

export const ShelfItem: React.FC<ShelfItemProps> = ({
  shelf,
  isShelves,
  setOpenAlert,
  padding = 'py-3',
}) => {
  const [isPending, startTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { selected } = useShelfStore();
  const updateSelected = useShelfStore((state) => state.updateSelected);
  const createQueryString = useCreateQueryString();

  const handleClick = useCallback(() => {
    updateSelected(shelf.name!);
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          shelf: shelf.name,
          page: 1,
          status: 'Any Status',
        })}`
      );
    });
  }, [shelf]);

  return (
    <>
      {shelf.name !== 'Favorites' && shelf.name !== 'Owned' && (
        <div
          className={`${
            selected && shelf.name === selected!.name
              ? 'bg-beige-100 text-beige-700'
              : 'text-gray-400'
          } mr-4 flex justify-between rounded-lg px-3 text-base font-normal ${
            isHovered ? 'hover:text-beige-700' : ''
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`cursor-pointer py-[10px]`} onClick={handleClick}>
            <span className='flex items-center'>
              <Icons.shelf className='mr-2 h-6 w-6' />
              <span className='w-44 truncate font-normal'>{shelf.name}</span>
            </span>
          </div>
          <span
            className={`flex cursor-pointer items-center rounded-sm px-1 text-sm ${
              isHovered ? 'text-beige-700' : 'text-gray-400'
            }`}
          >
            {isShelves && <div>{shelf._count.userBooks}</div>}
          </span>
        </div>
      )}
    </>
  );
};

export default ShelfItem;
