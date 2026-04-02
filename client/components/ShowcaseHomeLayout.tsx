"use client";
import { useEffect, useState } from "react";
import ShowcaseBlogSection from "@/components/ShowcaseBlogSection";
import ShowcaseFeaturesSection from "@/components/ShowcaseFeaturesSection";
import SchoolInfoDetails from "@/components/SchoolInfoDetails";
import type { ShowcaseBlogPost } from "@/components/ShowcasePostCard";
import { Card } from "@/components/ui/card";
import { DEFAULT_SCHOOL_INFO } from "@/config/schoolInfo";
import { HOME_FEATURES, HOME_POSTS } from "@/config/showcaseHome";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";
import { getAnnouncements, getSchoolInfo } from "@/lib/api";
import { strapiMediaFullUrl } from "@/lib/strapi/publicMediaUrl";
import { useRouter } from "next/navigation";

const HOME_POSTS_FALLBACK: ShowcaseBlogPost[] = HOME_POSTS.map((post, index) => ({
  id: -(index + 1),
  title: post.title,
  text: post.text,
}));

export default function ShowcaseHomeLayout() {
  const router = useRouter();
  const [topPosts, setTopPosts] = useState<ShowcaseBlogPost[]>(HOME_POSTS_FALLBACK);
  const { schoolInfo, isLoading, isUsingFallback } = useSchoolInfo({
    fetchSchoolInfo: getSchoolInfo,
    fallback: DEFAULT_SCHOOL_INFO,
  });

  const heroQuote = (schoolInfo.heroQuote?.trim() || DEFAULT_SCHOOL_INFO.heroQuote)?.replace(/^["']|["']$/g, "");
  const heroHeading =
    schoolInfo.heroHeading?.trim() || DEFAULT_SCHOOL_INFO.heroHeading || `Welcome to ${schoolInfo.name}`;
  const heroDescription =
    schoolInfo.heroDescription?.trim() || DEFAULT_SCHOOL_INFO.heroDescription || "";

  const heroSrc =
    strapiMediaFullUrl(schoolInfo.heroImage?.url) ??
    "/hero_image.jpg";

  const schoolInfoSrc =
    strapiMediaFullUrl(schoolInfo.schoolInfoImage?.url) ??
    "/Ceremony.jpg";

  const showcaseFeatures =
    schoolInfo.showcaseFeatures.length > 0 ? schoolInfo.showcaseFeatures : HOME_FEATURES;

  useEffect(() => {
    let active = true;

    async function loadTopPosts() {
      try {
        const announcements = await getAnnouncements();
        if (!active) return;

        const byMostRecent = [...announcements].sort(
          (a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        );
        const nonGeneral = byMostRecent.filter((announcement) => announcement.category !== "General");
        const source = nonGeneral.length < 4 ? byMostRecent.slice(0, 4) : nonGeneral.slice(0, 4);

        const posts = source
          .map((announcement) => ({
            id: announcement.id,
            title: announcement.title,
            text: announcement.content,
            image: announcement.image,
          }));

        if (posts.length > 0) {
          setTopPosts(posts);
        }
      } catch {
        // Keep fallback cards when announcements cannot be loaded.
      }
    }

    loadTopPosts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-background pb-12 text-foreground">
      <section className="container-wide py-8 sm:py-10">
        <Card className="grid gap-6 border-none bg-muted/60 md:grid-cols-2">
          <div className="flex flex-col justify-center pl-5">
            {heroQuote ? (
              <p className="text-sm italic text-muted-foreground">&quot;{heroQuote}&quot;</p>
            ) : null}
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{heroHeading}</h1>
            {heroDescription ? (
              <p className="mt-4 max-w-xl text-muted-foreground">{heroDescription}</p>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl bg-gradient-to-br from-sky-100 to-slate-300 p-1">
            <div className="relative flex h-64 min-h-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-200 via-sky-200 to-indigo-200 text-sm font-medium text-slate-700 sm:h-80">
              <img
                src={heroSrc}
                id="hero-image"
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith("/hero_image.jpg")) {
                    target.src = "/hero_image.jpg";
                  }
                }}
              />
            </div>
          </div>
        </Card>
      </section>

      <ShowcaseFeaturesSection features={showcaseFeatures} />
      <ShowcaseBlogSection posts={topPosts} onSeeMore={() => router.push("/announcements")} />

      <section className="container-wide pb-6">
        <Card className="grid gap-6 md:grid-cols-2">
          <div className="h-64 overflow-hidden rounded-xl sm:h-72">
            <img
              src={schoolInfoSrc}
              id="school-info-image"
              alt="School"
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith("/Ceremony.jpg")) {
                  target.src = "/Ceremony.jpg";
                }
              }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="mt-4 p-4 text-sm">
              <p className="font-semibold text-foreground">School Information</p>
              <SchoolInfoDetails schoolInfo={schoolInfo} isLoading={isLoading} isUsingFallback={isUsingFallback} />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
