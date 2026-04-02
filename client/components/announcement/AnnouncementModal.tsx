"use client";

import { useState } from "react";
import Image from "next/image";
import type { Announcement } from "@/lib/types";
import { strapiMediaFullUrl } from "@/lib/strapi/publicMediaUrl";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AnnouncementModalProps } from "./types";

const AnnouncementModal = ({ open, onClose, announcement, longDate }: AnnouncementModalProps) => {
  const [imgError, setImgError] = useState(false);
  const resolved = strapiMediaFullUrl(announcement.image?.url);
  const imgSrc = resolved && !imgError ? resolved : "/placeholder.jpg";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent maxWidth="2xl">
        <DialogHeader>
          <DialogTitle>{announcement.title}</DialogTitle>
        </DialogHeader>
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-semibold">
          {announcement.category}
        </Badge>
        <time className="text-2xl sm:text-3xl" dateTime={announcement.datePosted}>
          {longDate}
        </time>
      </div>

      {resolved ? (
        <div className="relative mb-5 h-56 overflow-hidden rounded-2xl border bg-muted/50 sm:h-72">
          <Image
            src={imgSrc}
            alt={announcement.title}
            fill
            className="object-contain"
            unoptimized
            onError={() => setImgError(true)}
          />
        </div>
      ) : null}

      <p className="text-lg sm:text-xl">{announcement.content}</p>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementModal;
