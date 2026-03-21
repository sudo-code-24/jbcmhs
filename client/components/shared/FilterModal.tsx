"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FilterModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onReset: () => void;
  onApply: () => void;
};

const FilterModal = ({ open, onClose, title, children, onReset, onApply }: FilterModalProps) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent maxWidth="2xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
    <div className="space-y-3">
      {children}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
        <Button type="button" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
    </DialogContent>
  </Dialog>
);

export default FilterModal;
