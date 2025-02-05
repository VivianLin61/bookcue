import { User } from '@prisma/client';
import type { Icon } from 'lucide-react';

import { Icons } from '@/components/icons';

export type NavItem = {
  id?: string;
  title?: string;
  href?: string;
  type?: string;
  disabled?: boolean;
  icon?: keyof typeof Icons;
};

export type MainNavItem = NavItem;

export type SiteConfig = {
  name: string;
  links: {
    github: string;
  };
  mainNav: MainNavItem[];
  userNav: NavItem[];
  settingsNav: NavItem[];
};
