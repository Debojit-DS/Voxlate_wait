export function WhatIsVoxlate() {
  return (
    <section id="about" className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange mb-3">What is Voxlate?</p>
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">What is Voxlate?</h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Voxlate is an AI-powered communication platform designed to eliminate language barriers while preserving the speaker&apos;s natural voice, tone, and emotions. Whether online or face-to-face, conversations feel natural without requiring anyone to learn a new language.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[420px]">
              <img
                src="/images/voxlate-brand.png"
                alt="Voxlate - Breaking Language Barriers"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
