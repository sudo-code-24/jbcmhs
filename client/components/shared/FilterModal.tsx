"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

type FilterModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onReset: () => void;
  onApply: () => void;
};

const FilterModal = ({ open, onClose, title, children, onReset, onApply }: FilterModalProps) => (
  <Modal open={open} onClose={onClose} title={title}>
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
  </Modal>
);

export default FilterModal;
