export default function Footer() {
  return (
    <footer className="hidden border-t bg-background py-8 md:flex">
      <div className="container-wide flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Jose B. Cardenas Mem HS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
