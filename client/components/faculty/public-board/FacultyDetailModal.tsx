"use client";

import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import FacultyPhoto from "../FacultyPhoto";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FacultyDetailModalProps = {
  card: FacultyCardItem | null;
  open: boolean;
  onClose: () => void;
};

export function FacultyDetailModal({
  card,
  open,
  onClose,
}: FacultyDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent maxWidth="lg">
        <DialogHeader>
          <DialogTitle>{card?.name ?? "Faculty"}</DialogTitle>
        </DialogHeader>
        {card ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <FacultyPhoto
              photoUrl={card.photoUrl}
              name={card.name}
              tone="light"
              className="mx-auto h-32 w-32 shrink-0 sm:mx-0 sm:h-36 sm:w-36"
              iconClassName="h-[40%] w-[40%]"
            />
            <dl className="min-w-0 flex-1 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Role
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {card.role}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Department
                </dt>
                <dd className="mt-0.5 text-foreground">{card.boardSection}</dd>
              </div>
              {card.email ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </dt>
                  <dd className="mt-0.5 break-all">
                    <a
                      href={`mailto:${card.email}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {card.email}
                    </a>
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </dt>
                  <dd className="mt-0.5 text-muted-foreground">—</dd>
                </div>
              )}
              {card.phone ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href={`tel:${card.phone.replace(/\s/g, "")}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {card.phone}
                    </a>
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-0.5 text-muted-foreground">—</dd>
                </div>
              )}
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
