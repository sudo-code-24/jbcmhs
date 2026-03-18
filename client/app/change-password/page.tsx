import ChangePasswordForm from "./ChangePasswordForm";

type ChangePasswordPageProps = {
  searchParams?: {
    email?: string;
    next?: string;
  };
};

export default function ChangePasswordPage({ searchParams }: ChangePasswordPageProps) {
  const email = searchParams?.email || "";
  const nextPath = searchParams?.next || "/admin";

  return (
    <div className="container-wide flex min-h-[70vh] items-center justify-center py-8 sm:py-10 md:py-12">
      <ChangePasswordForm email={email} nextPath={nextPath} />
    </div>
  );
}
