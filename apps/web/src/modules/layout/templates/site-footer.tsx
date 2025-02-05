import * as React from 'react';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { dm_sefif_display } from '@/lib/fonts';

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className, 'bg-beige-400 p-4')}>
      <div className='container flex-col items-center justify-between gap-4 md:h-24 md:flex-row md:py-0'>
        <div className='hidden items-center space-x-2 md:flex'>
          <h1
            className={cn(
              dm_sefif_display.className,
              'hidden text-3xl text-beige sm:inline-block '
            )}
          >
            {siteConfig.name}
          </h1>
        </div>
        <p className='text-center text-sm leading-loose md:text-left'>
          © 2022 Bookshelf. All rights Reserverd . Book data from{' '}
          <a
            href='https://developers.google.com/books'
            target='_blank'
            rel='noreferrer'
            className='font-medium underline underline-offset-4'
          >
            Google Books API
          </a>
          . The source code is available on{' '}
          <a
            href={siteConfig.links.github}
            target='_blank'
            rel='noreferrer'
            className='font-medium underline underline-offset-4'
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
