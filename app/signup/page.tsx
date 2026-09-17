import { Suspense } from "react";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage(props: { searchParams: Promise<URLSearchParams> }) {
  const searchParams = await props.searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-[420px] text-center">
              <p className="text-text-secondary text-sm">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <SignupForm searchParams={searchParams} />
    </Suspense>
  );
}
