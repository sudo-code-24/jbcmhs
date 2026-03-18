import { Card } from "@/components/ui/card";
import type { Feature } from "@/config/showcaseHome";
import ShowcaseFeatureCard from "@/components/ShowcaseFeatureCard";

export default function ShowcaseFeaturesSection({ features }: { features: Feature[] }) {
  return (
    <section className="container-wide pb-8">
      <Card className="border-none sm:hidden">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
          {features.map((feature) => (
            <div key={feature.title} className="min-w-[85%] snap-center">
              <ShowcaseFeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="hidden gap-5 border-none sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <ShowcaseFeatureCard key={feature.title} feature={feature} />
        ))}
      </Card>
    </section>
  );
}
