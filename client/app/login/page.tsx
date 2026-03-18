import LoginForm from "./LoginForm";

type LoginPageProps = {
  searchParams?: { next?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = searchParams?.next || "/admin";
  return (
    <div className="container-wide flex min-h-[70vh] items-center justify-center py-8 sm:py-10 md:py-12">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
