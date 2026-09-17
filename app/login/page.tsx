import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage(props: { searchParams: Promise<URLSearchParams> }) {
  const searchParams = await props.searchParams;
  const redirectTo = searchParams.get("redirectTo") || "/";

  return <LoginForm redirectTo={redirectTo} />;
}
