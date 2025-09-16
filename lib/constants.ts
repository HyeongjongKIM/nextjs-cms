import { Role } from './generated/prisma';

export const ROLE: {
  [key in Role]: { label: string; color: string; hierarchy: number };
} = {
  [Role.VIEWER]: {
    label: 'Viewer',
    color: 'bg-gray-100 text-gray-800',
    hierarchy: 1,
  },
  [Role.EDITOR]: {
    label: 'Editor',
    color: 'bg-blue-100 text-blue-800',
    hierarchy: 2,
  },
  [Role.SUPER_ADMIN]: {
    label: 'Super Admin',
    color: 'bg-red-100 text-red-800',
    hierarchy: 3,
  },
};
