'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimesheetHeaderProps {
  startDate: Date;
  endDate: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export function TimesheetHeader({
  startDate,
  endDate,
  onPrevious,
  onNext,
}: TimesheetHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Timesheet</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <span className="font-medium">
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
            </span>
        </div>
      </div>
    </div>
  );
}