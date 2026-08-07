import Image from "next/image";

export function HowItWorks() {
  return (
    <section className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-orange mb-2">HOW IT WORKS</p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Real-time Translation Between Two People</h2>
        </div>
        <div className="mt-10">
          <Image
            src="/images/digital-how-it-works.png"
            alt="How Voxlate Digital works"
            width={1400}
            height={720}
            className="h-auto w-full rounded-card"
            priority
          />
        </div>
      </div>
    </section>
  );
}
