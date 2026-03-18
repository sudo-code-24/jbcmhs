import LoadingSpinner from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="container-wide flex min-h-[40vh] items-center justify-center py-10">
      <div className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm text-muted-foreground">
        <LoadingSpinner className="h-5 w-5" />
        Loading...
      </div>
    </div>
  );
}
