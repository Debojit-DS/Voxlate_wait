import Image from "next/image";

interface PlatformItem {
  name: string;
  image?: string;
  label?: string;
  isGoTo?: boolean;
  width?: number;
  height?: number;
  imageClass?: string;
}

const PLATFORMS: PlatformItem[] = [
  {
    name: "Zoom",
    image: "/images/platforms/zoom.svg",
    imageClass: "h-7 w-24",
  },
  {
    name: "Google Meet",
    image: "/images/platforms/google-meet.webp",
    imageClass: "h-6.5 w-28",
  },
  {
    name: "Microsoft Teams",
    image: "/images/platforms/microsoft-teams.webp",
    label: "Microsoft Teams",
    imageClass: "h-7 w-7",
  },
  {
    name: "Webex",
    image: "/images/platforms/webex.svg",
    imageClass: "h-7 w-28",
  },
  {
    name: "GoTo Meeting",
    image: "/images/platforms/goto-meeting.svg",
    label: "GoTo Meeting",
    isGoTo: true,
    imageClass: "h-6 w-6",
  },
];

export function WorksOnPlatforms() {
  return (
    <section aria-labelledby="platforms-heading" className="border-t border-line bg-page pt-14 pb-8 md:pt-16 md:pb-10">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h2
          id="platforms-heading"
          className="text-center font-display text-[34px] sm:text-[42px] md:text-[50px] leading-[1.08] text-ink font-normal tracking-tight"
        >
          Works on All Major Platforms
        </h2>

        <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="flex h-[88px] md:h-[96px] items-center justify-center rounded-[12px] border border-line bg-surface p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-line-strong hover:shadow-xs"
            >
              {platform.label ? (
                <div className="flex items-center gap-2">
                  <div className={`relative shrink-0 ${platform.imageClass || "h-7 w-7"}`}>
                    <Image
                      src={platform.image!}
                      alt={platform.name}
                      fill
                      sizes="60px"
                      className="object-contain"
                    />
                  </div>
                  {platform.isGoTo ? (
                    <span className="text-[13px] md:text-[14px] text-ink whitespace-nowrap">
                      <strong className="font-bold">GoTo</strong> Meeting
                    </span>
                  ) : (
                    <span className="text-[13px] md:text-[14px] font-semibold text-ink whitespace-nowrap">
                      {platform.label}
                    </span>
                  )}
                </div>
              ) : (
                <div className={`relative shrink-0 ${platform.imageClass || "h-7 w-24"}`}>
                  <Image
                    src={platform.image!}
                    alt={platform.name}
                    fill
                    sizes="120px"
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex h-[88px] md:h-[96px] flex-col items-center justify-center rounded-[12px] border border-line bg-surface p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-line-strong hover:shadow-xs">
            <span className="text-[13px] md:text-[14px] font-bold text-ink">&amp; More</span>
            <span className="text-[11px] md:text-[12px] font-medium text-slate">Coming Soon</span>
          </div>
        </div>

        <p className="mt-8 text-center text-[18px] sm:text-[19px] md:text-[20px] leading-[1.7] text-slate max-w-[64ch] mx-auto">
          Seamless integration. No bots. No extra links. Just install and start your meeting.
        </p>
      </div>
    </section>
  );
}

