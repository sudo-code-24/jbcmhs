"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { getSchoolInfo, updateSchoolProfile } from "@/lib/api";
import type { SchoolInfo, SchoolShowcaseFeature } from "@/lib/types";
import { debugLogFormData } from "@/lib/strapi/formDataDebug";
import { strapiMediaFullUrl } from "@/lib/strapi/publicMediaUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/ui/loading-spinner";

type AdminSchoolProfileProps = {
  initial: SchoolInfo;
  onDirtyChange?: (dirty: boolean) => void;
};

/** All editable school profile fields + pending uploads (not sent as JSON keys). */
type SchoolProfileFormState = {
  name: string;
  tagline: string;
  heroQuote: string;
  heroHeading: string;
  heroDescription: string;
  phone: string;
  email: string;
  address: string;
  officeHours: string;
  facebookUrl: string;
  history: string;
  mission: string;
  vision: string;
  features: SchoolShowcaseFeature[];
  heroFile: File | null;
  schoolInfoFile: File | null;
};

const FORM_DATA_SKIP = new Set(["features", "heroFile", "schoolInfoFile"]);

const emptyFeature = (): SchoolShowcaseFeature => ({
  title: "",
  text: "",
  icon: "⭐",
});

function schoolInfoToForm(p: SchoolInfo): SchoolProfileFormState {
  return {
    name: p.name,
    tagline: p.tagline,
    heroQuote: p.heroQuote ?? "",
    heroHeading: p.heroHeading ?? "",
    heroDescription: p.heroDescription ?? "",
    phone: p.phone,
    email: p.email,
    address: p.address,
    officeHours: p.officeHours,
    facebookUrl: p.facebookUrl ?? "",
    history: p.history,
    mission: p.mission,
    vision: p.vision,
    features:
      p.showcaseFeatures.length > 0
        ? p.showcaseFeatures.map((f) => ({ ...f }))
        : [emptyFeature()],
    heroFile: null,
    schoolInfoFile: null,
  };
}

function snapshotFromSchoolInfo(p: SchoolInfo): string {
  const f = schoolInfoToForm(p);
  f.heroFile = null;
  f.schoolInfoFile = null;
  return snapshotFormForDirty(f);
}

function snapshotFormForDirty(form: SchoolProfileFormState): string {
  return JSON.stringify({
    name: form.name,
    tagline: form.tagline,
    heroQuote: form.heroQuote,
    heroHeading: form.heroHeading,
    heroDescription: form.heroDescription,
    phone: form.phone,
    email: form.email,
    address: form.address,
    officeHours: form.officeHours,
    facebookUrl: form.facebookUrl,
    history: form.history,
    mission: form.mission,
    vision: form.vision,
    showcaseFeatures: form.features
      .filter((x) => x.title.trim())
      .map((x) => ({ title: x.title.trim(), text: x.text, icon: x.icon })),
    hasHeroFile: Boolean(form.heroFile && form.heroFile.size > 0),
    hasSchoolFile: Boolean(form.schoolInfoFile && form.schoolInfoFile.size > 0),
  });
}

function buildSchoolProfileFormData(form: SchoolProfileFormState): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(form)) {
    if (FORM_DATA_SKIP.has(key)) continue;
    if (value === null || value === undefined) continue;
    fd.append(key, String(value));
  }
  const showcasePayload = form.features
    .filter((f) => f.title.trim())
    .map((f) => ({ ...f, title: f.title.trim() }));
  fd.append("showcaseFeatures", JSON.stringify(showcasePayload));
  if (form.heroFile && form.heroFile.size > 0) {
    fd.append("files.heroImage", form.heroFile, form.heroFile.name || "hero.jpg");
  }
  if (form.schoolInfoFile && form.schoolInfoFile.size > 0) {
    fd.append(
      "files.schoolInfoImage",
      form.schoolInfoFile,
      form.schoolInfoFile.name || "school-info.jpg",
    );
  }
  return fd;
}

const sectionShell = "rounded-lg border border-border bg-card shadow-sm";

const sectionHeaderClass =
  "flex w-full cursor-pointer select-none items-center justify-between gap-2 border-b border-border/60 px-4 py-3 text-left text-base font-semibold " +
  "text-card-foreground hover:bg-muted/40";

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={sectionShell}>
      <button
        type="button"
        className={sectionHeaderClass}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="min-w-0 flex-1">{title}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {expanded ? <div className="space-y-4 p-4">{children}</div> : null}
    </div>
  );
}

type SectionKey = "hero" | "showcase" | "school" | "about";

export default function AdminSchoolProfile({
  initial,
  onDirtyChange,
}: AdminSchoolProfileProps) {
  const [profile, setProfile] = useState<SchoolInfo>(initial);
  const [form, setForm] = useState<SchoolProfileFormState>(() =>
    schoolInfoToForm(initial),
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [openSection, setOpenSection] = useState<Record<SectionKey, boolean>>({
    hero: true,
    showcase: true,
    school: true,
    about: true,
  });

  const shellRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const savedBaselineRef = useRef<string>(snapshotFromSchoolInfo(initial));

  const toggleSection = (key: SectionKey) => {
    setOpenSection((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleChange = useCallback(
    <K extends keyof SchoolProfileFormState>(field: K, value: SchoolProfileFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateFeature = useCallback(
    (index: number, key: keyof SchoolShowcaseFeature, value: string) => {
      setForm((prev) => ({
        ...prev,
        features: prev.features.map((row, i) =>
          i === index ? { ...row, [key]: value } : row,
        ),
      }));
    },
    [],
  );

  const scrollSchoolFormToTop = useCallback(() => {
    const run = () => {
      scrollAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      shellRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, []);

  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  const [schoolPreviewUrl, setSchoolPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!form.heroFile) {
      setHeroPreviewUrl(null);
      return undefined;
    }
    const u = URL.createObjectURL(form.heroFile);
    setHeroPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [form.heroFile]);

  useEffect(() => {
    if (!form.schoolInfoFile) {
      setSchoolPreviewUrl(null);
      return undefined;
    }
    const u = URL.createObjectURL(form.schoolInfoFile);
    setSchoolPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [form.schoolInfoFile]);

  const heroDisplay =
    heroPreviewUrl ??
    strapiMediaFullUrl(profile.heroImage?.url) ??
    "/hero_image.jpg";
  const schoolDisplay =
    schoolPreviewUrl ??
    strapiMediaFullUrl(profile.schoolInfoImage?.url) ??
    "/Ceremony.jpg";

  const syncFromProfile = useCallback((p: SchoolInfo) => {
    savedBaselineRef.current = snapshotFromSchoolInfo(p);
    setProfile(p);
    setForm(schoolInfoToForm(p));
  }, []);

  const currentSnapshot = useMemo(() => snapshotFormForDirty(form), [form]);

  const isDirty = useMemo(
    () => currentSnapshot !== savedBaselineRef.current,
    [currentSnapshot],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    return () => {
      onDirtyChange?.(false);
    };
  }, [onDirtyChange]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    let cancelled = false;
    void getSchoolInfo().then((data) => {
      if (cancelled || !data) return;
      syncFromProfile(data);
    });
    return () => {
      cancelled = true;
    };
  }, [syncFromProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const fd = buildSchoolProfileFormData(form);
      debugLogFormData(fd, "client → PUT /api/school-profile");
      const next = await updateSchoolProfile(fd);
      syncFromProfile(next);
      setMessage({ type: "ok", text: "School profile saved." });
      scrollSchoolFormToTop();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[AdminSchoolProfile save]", err);
      }
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={shellRef}
      className={
        "flex flex-col overflow-hidden rounded-lg border border-border bg-muted/20 " +
        "h-[75dvh]"
      }
    >
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div
          ref={scrollAreaRef}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-3 py-3 sm:px-4"
        >
          <div className="mx-auto flex max-w-full flex-col gap-4 pb-2">
            {message ? (
              <p
                className={
                  message.type === "ok"
                    ? "rounded-md bg-emerald-500/10 p-2 text-sm text-emerald-700 dark:text-emerald-400"
                    : "rounded-md bg-destructive/10 p-2 text-sm text-destructive"
                }
              >
                {message.text}
              </p>
            ) : null}

            <CollapsibleSection
              title="Hero (home top section)"
              expanded={openSection.hero}
              onToggle={() => toggleSection("hero")}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sp-hero-quote">Quote</Label>
                  <Input
                    id="sp-hero-quote"
                    value={form.heroQuote}
                    onChange={(e) => handleChange("heroQuote", e.target.value)}
                    placeholder="Short italic line above the heading"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp-tagline">
                    Header tagline (nav bar subtitle)
                  </Label>
                  <Input
                    id="sp-tagline"
                    value={form.tagline}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-hero-heading">Heading</Label>
                <Textarea
                  id="sp-hero-heading"
                  value={form.heroHeading}
                  onChange={(e) => handleChange("heroHeading", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-hero-desc">Description</Label>
                <Textarea
                  id="sp-hero-desc"
                  value={form.heroDescription}
                  onChange={(e) => handleChange("heroDescription", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-hero-img">Hero image</Label>
                <Input
                  id="sp-hero-img"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(e) =>
                    handleChange("heroFile", e.target.files?.[0] ?? null)
                  }
                />
                <div className="overflow-hidden rounded-md border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <a
                    href={heroDisplay}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={heroDisplay}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  </a>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Showcase cards (home)"
              expanded={openSection.showcase}
              onToggle={() => toggleSection("showcase")}
            >
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      features: [...prev.features, emptyFeature()],
                    }))
                  }
                >
                  <Plus className="mr-1 size-4" />
                  Add card
                </Button>
              </div>
              {form.features.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No cards configured — the public home page will use the
                  built-in default feature list until you add at least one.
                </p>
              ) : null}
              {form.features.map((f, i) => (
                <div
                  key={i}
                  className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3"
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Icon (emoji)</Label>
                      <Input
                        value={f.icon}
                        onChange={(e) =>
                          updateFeature(i, "icon", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Title</Label>
                      <Input
                        value={f.title}
                        onChange={(e) =>
                          updateFeature(i, "title", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Input
                      value={f.text}
                      onChange={(e) => updateFeature(i, "text", e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          features: prev.features.filter((_, j) => j !== i),
                        }))
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              title="School information (home bottom + contact)"
              expanded={openSection.school}
              onToggle={() => toggleSection("school")}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sp-name">School name</Label>
                  <Input
                    id="sp-name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp-fb">Facebook URL</Label>
                  <Input
                    id="sp-fb"
                    type="url"
                    value={form.facebookUrl}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    placeholder="https://…"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-address">Address</Label>
                <Textarea
                  id="sp-address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sp-phone">Phone</Label>
                  <Input
                    id="sp-phone"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp-email">Email</Label>
                  <Input
                    id="sp-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-hours">Office hours</Label>
                <Input
                  id="sp-hours"
                  value={form.officeHours}
                  onChange={(e) => handleChange("officeHours", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-school-img">
                  School info image (left column)
                </Label>
                <Input
                  id="sp-school-img"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(e) =>
                    handleChange("schoolInfoFile", e.target.files?.[0] ?? null)
                  }
                />
                <div className="overflow-hidden rounded-md border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <a
                    href={schoolDisplay}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={schoolDisplay}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  </a>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="About (mission, vision, history)"
              expanded={openSection.about}
              onToggle={() => toggleSection("about")}
            >
              <div className="space-y-2">
                <Label htmlFor="sp-history">History</Label>
                <Textarea
                  id="sp-history"
                  value={form.history}
                  onChange={(e) => handleChange("history", e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-mission">Mission</Label>
                <Textarea
                  id="sp-mission"
                  value={form.mission}
                  onChange={(e) => handleChange("mission", e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-vision">Vision</Label>
                <Textarea
                  id="sp-vision"
                  value={form.vision}
                  onChange={(e) => handleChange("vision", e.target.value)}
                  rows={4}
                />
              </div>
            </CollapsibleSection>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-6px_16px_-8px_rgba(0,0,0,0.12)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-full justify-end">
            <Button type="submit" disabled={loading} className="min-w-[10rem]">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner />
                  Saving…
                </span>
              ) : (
                "Save school profile"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
