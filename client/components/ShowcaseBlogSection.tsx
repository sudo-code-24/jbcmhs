import { Button } from "@/components/ui/button";
import ShowcasePostCard, { type ShowcaseBlogPost } from "@/components/ShowcasePostCard";

type ShowcaseBlogSectionProps = {
  posts: ShowcaseBlogPost[];
  onSeeMore: () => void;
};

export default function ShowcaseBlogSection({ posts, onSeeMore }: ShowcaseBlogSectionProps) {
  return (
    <section id="home-blog-section" className="container-wide scroll-mt-24 py-10 text-center">
      <p className="text-sm text-muted-foreground">Our Blog</p>
      <h2 className="mt-2 text-3xl font-bold">Latest News & Updates</h2>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
        Stay informed about school events, achievements, and important announcements.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <ShowcasePostCard key={post.title} post={post} />
        ))}
      </div>
      <Button className="mt-6 rounded-full" onClick={onSeeMore}>
        See More
      </Button>
    </section>
  );
}
