"use client";

import { useState } from "react";
import Image from "next/image";
import type { Announcement } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import type { AnnouncementModalProps } from "./types";

const AnnouncementModal = ({ open, onClose, announcement, longDate }: AnnouncementModalProps) => {
  const [imgError, setImgError] = useState(false);
  const imgSrc =
    announcement.imageUrl?.trim() && !imgError ? announcement.imageUrl.trim()! : "/placeholder.jpg";

  return (
    <Modal open={open} onClose={onClose} title={announcement.title} size="2xl">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-semibold">
          {announcement.category}
        </Badge>
        <time className="text-2xl sm:text-3xl" dateTime={announcement.datePosted}>
          {longDate}
        </time>
      </div>

      {announcement.imageUrl && (
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
      )}

      <p className="text-lg sm:text-xl">{announcement.content}</p>
    </Modal>
  );
};

export default AnnouncementModal;
