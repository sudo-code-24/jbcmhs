import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
  className?: string;
};

export default function LoadingSpinner({ className = "h-4 w-4" }: LoadingSpinnerProps) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}
