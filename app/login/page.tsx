import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage(props: { searchParams: Promise<URLSearchParams> }) {
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
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}
