import type { SchoolInfo } from "@/lib/types";

type SchoolInfoDetailsProps = {
  schoolInfo: SchoolInfo;
  isLoading: boolean;
  isUsingFallback: boolean;
};

export default function SchoolInfoDetails({ schoolInfo, isLoading, isUsingFallback }: SchoolInfoDetailsProps) {
  if (isLoading) {
    return <p className="mt-2 text-muted-foreground">Loading school information...</p>;
  }

  return (
    <div className="mt-2 space-y-1.5 text-muted-foreground">
      {isUsingFallback ? <p className="text-xs text-muted-foreground">Showing default information.</p> : null}
      <p>
        <span className="font-medium text-foreground">Name: </span> {schoolInfo.name}
      </p>
      <p>
        <span className="font-medium text-foreground">Address: </span> {schoolInfo.address}
      </p>
      <p>
        <span className="font-medium text-foreground">Contact Number: </span> {schoolInfo.phone}
      </p>
      <p>
        <span className="font-medium text-foreground">Email: </span> {schoolInfo.email}
      </p>
      <p>
        <span className="font-medium text-foreground">Office Hours: </span> {schoolInfo.officeHours}
      </p>
      <p>
        <span className="font-medium text-foreground">Facebook Page: </span>
        {schoolInfo.facebookUrl?.trim() ? (
          <a href={schoolInfo.facebookUrl.trim()} target="_blank" rel="noopener noreferrer">
            Click here
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </p>
    </div>
  );
}
