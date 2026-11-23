import DemoPageClient from "./DemoPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Web demo — Voxlate",
  description: "Say a sentence and hear it in another language, in your own voice. The Voxlate web demo.",
};

export default function DemoPage() {
  return <DemoPageClient />;
}
