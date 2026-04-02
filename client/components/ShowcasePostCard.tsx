import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { StrapiMedia } from "@/lib/types";
import { strapiMediaFullUrl } from "@/lib/strapi/publicMediaUrl";

export type ShowcaseBlogPost = {
  id: number;
  title: string;
  text: string;
  image?: StrapiMedia;
};

export default function ShowcasePostCard({ post }: { post: ShowcaseBlogPost }) {
  const href = `/announcements/${post.id}`;
  const imgSrc = strapiMediaFullUrl(post.image?.url) ?? "/placeholder.jpg";

  return (
    <Card className="flex h-full flex-col overflow-hidden text-left">
      <div className="h-36 overflow-hidden">
        <img src={imgSrc} alt={post.title} className="h-full w-full object-cover" />
      </div>
      <CardContent className="flex-1 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.text}</p>
      </CardContent>
      <CardFooter className="mt-auto border-t p-0">
        <Button asChild variant="ghost" className="w-full rounded-none">
          <Link href={href}>Read more</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
