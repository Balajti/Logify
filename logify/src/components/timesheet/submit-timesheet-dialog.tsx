'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubmitTimesheetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function SubmitTimesheetDialog({
  open,
  onClose,
  onSubmit,
}: SubmitTimesheetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Timesheet</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit this timesheet? Once submitted, it cannot be modified.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// src/components/dialog/confirm-logout.tsx