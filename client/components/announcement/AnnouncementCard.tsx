"use client";

import { useMemo, useState, useCallback } from "react";
import { formatShortDate, formatLongDate } from "@/lib/formatDate";
import AnnouncementCardList from "./AnnouncementCardList";
import AnnouncementCardGrid from "./AnnouncementCardGrid";
import AnnouncementModal from "./AnnouncementModal";
import type { AnnouncementCardProps } from "./types";

const AnnouncementCard = ({ announcement, view = "list" }: AnnouncementCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const shortDate = useMemo(() => formatShortDate(announcement.datePosted), [announcement.datePosted]);
  const longDate = useMemo(() => formatLongDate(announcement.datePosted), [announcement.datePosted]);
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const isGrid = view === "grid";

  return (
    <>
      {isGrid ? (
        <AnnouncementCardGrid announcement={announcement} shortDate={shortDate} onOpen={onOpen} />
      ) : (
        <AnnouncementCardList announcement={announcement} shortDate={shortDate} onOpen={onOpen} />
      )}

      <AnnouncementModal
        open={isOpen}
        onClose={onClose}
        announcement={announcement}
        longDate={longDate}
      />
    </>
  );
};

export default AnnouncementCard;
