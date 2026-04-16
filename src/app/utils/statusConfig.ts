import { ApplicationStatus } from '../types';

export const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  'not-yet-open': {
    label: 'Not Yet Open',
    color: 'text-sky-700',
    bgColor: 'bg-sky-100',
    borderColor: 'border-sky-300',
  },
  'not-started': {
    label: 'Not Started',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
  },
  submitted: {
    label: 'Submitted',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
  },
  accepted: {
    label: 'Accepted',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
  waitlisted: {
    label: 'Waitlisted',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
  },
  awarded: {
    label: 'Awarded',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
  },
};

export const ALL_STATUSES: ApplicationStatus[] = [
  'not-yet-open',
  'not-started',
  'in-progress',
  'submitted',
  'accepted',
  'rejected',
  'waitlisted',
  'awarded',
];

export const getDeadlineUrgency = (deadline: string | null): 'urgent' | 'warning' | 'normal' => {
  if (!deadline) return 'normal';
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const days = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 14) return 'urgent';
  if (days < 30) return 'warning';
  return 'normal';
};

export const getDaysUntil = (date: string | null): number | null => {
  if (!date) return null;
  const target = new Date(date);
  const today = new Date();
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
