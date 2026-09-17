import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage(props: { searchParams: Promise<URLSearchParams> }) {
  const searchParams = await props.searchParams;
  const redirectTo = searchParams.get("redirectTo") || "/";

  return <SignupForm redirectTo={redirectTo} />;
}
