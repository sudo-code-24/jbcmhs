"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MultiSelectOption = {
  label: string;
  value: string;
};

type MultiSelectDropdownProps = {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (next: string[]) => void;
  allLabel?: string;
  className?: string;
};

export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  allLabel,
  className,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectedLabels = useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)).map((option) => option.label),
    [options, selectedValues]
  );

  const buttonText =
    selectedLabels.length === 0
      ? (allLabel ?? `All ${label}`)
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`;

  function toggleValue(value: string) {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }
    onChange([...selectedValues, value]);
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full justify-between"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate text-left">{buttonText}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
      </Button>

      {open ? (
        <div className="absolute left-0 top-full z-40 mt-2 w-full min-w-[220px] rounded-md border bg-popover p-2 text-popover-foreground shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {selectedValues.length > 0 ? (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => onChange([])}
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="max-h-56 space-y-1 overflow-auto">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onClick={() => toggleValue(option.value)}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input"
                    }`}
                  >
                    {isSelected ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
