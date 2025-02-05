import { getCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

function DashboardHeader({
  title,
  count,
  href,
}: {
  title: string;
  count?: number;
  href: string;
}) {
  return (
    <>
      <h2 className={cn('space-x-4')}>
        <span className='text-xl font-semibold text-beige-700'>{title}</span>
      </h2>
      <Link href={href} className='text-gray-400'>
        View more
      </Link>
    </>
  );
}

export default DashboardHeader;
