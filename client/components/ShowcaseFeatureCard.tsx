import { Card, CardContent } from "@/components/ui/card";
import type { Feature } from "@/config/showcaseHome";

export default function ShowcaseFeatureCard({ feature }: { feature: Feature }) {
  return (
    <Card className="border shadow-none transition hover:bg-accent">
      <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:items-start sm:text-left">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-lg dark:bg-indigo-950/40">
          {feature.icon}
        </div>
        <h3 className="text-sm font-semibold">{feature.title}</h3>
        <p className="text-sm text-muted-foreground">{feature.text}</p>
      </CardContent>
    </Card>
  );
}
