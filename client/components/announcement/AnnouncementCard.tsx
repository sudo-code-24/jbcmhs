"use client";

import { useMemo, useState } from "react";
import AnnouncementCardList from "./AnnouncementCardList";
import AnnouncementCardGrid from "./AnnouncementCardGrid";
import AnnouncementModal from "./AnnouncementModal";
import type { AnnouncementCardProps } from "./types";

const AnnouncementCard = ({ announcement, view = "list" }: AnnouncementCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { shortDate, longDate } = useMemo(() => {
    const date = new Date(announcement.datePosted);
    return {
      shortDate: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      longDate: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }, [announcement.datePosted]);

  const isGrid = view === "grid";

  return (
    <>
      {isGrid ? (
        <AnnouncementCardGrid
          announcement={announcement}
          shortDate={shortDate}
          onOpen={() => setIsOpen(true)}
        />
      ) : (
        <AnnouncementCardList
          announcement={announcement}
          shortDate={shortDate}
          onOpen={() => setIsOpen(true)}
        />
      )}

      <AnnouncementModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        announcement={announcement}
        longDate={longDate}
      />
    </>
  );
};

export default AnnouncementCard;
