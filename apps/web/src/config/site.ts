import { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  name: 'Bookshelf',
  links: {
    github: 'https://github.com/VivianLin61/bookshelf',
  },
  mainNav: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'My Library',
      href: '/',
    },
    {
      title: 'Browse',
      href: '/browse',
    },
  ],
  userNav: [
    {
      title: 'Activity',
      href: '/activity',
    },
    {
      title: 'Books',
      href: '/books',
    },
    {
      title: 'Journal',
      href: '/journal',
    },
    {
      title: 'Statistics',
      href: '/stats',
    },
    {
      title: 'Goals',
      href: '/goals',
    },
  ],
  settingsNav: [
    { href: '/settings/personal', title: 'Personal Information' },
    { href: '/settings/account', title: 'Account' },
    { href: '/settings/import', title: 'Import' },
  ],
};
