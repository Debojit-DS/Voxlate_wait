import ResetPasswordFormClient from "./ResetPasswordFormClient";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage(props: { searchParams: Promise<URLSearchParams> }) {
  const searchParams = await props.searchParams;
  const token = searchParams.get("token") || "";

  return <ResetPasswordFormClient token={token} />;
}
