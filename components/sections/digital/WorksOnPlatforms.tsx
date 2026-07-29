import Image from "next/image";

const PLATFORMS = [
  { name: "zoom", image: "/images/platforms/zoom.svg" },
  { name: "Google Meet", image: "/images/platforms/google-meet.webp", large: true },
  { name: "Microsoft Teams", image: "/images/platforms/microsoft-teams.webp", label: "Microsoft Teams" },
  { name: "webex", image: "/images/platforms/webex.svg", subtitle: "by Cisco", large: true },
  { name: "GoTo Meeting", image: "/images/platforms/goto-meeting.svg", label: "GoTo Meeting" },
];

export function WorksOnPlatforms() {
  return (
    <section className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h2 className="text-center text-xl md:text-2xl font-bold text-text-primary mb-10">
          WORKS ON ALL MAJOR PLATFORMS
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="bg-bg-surface-alt border border-border rounded-card flex items-center justify-center gap-2 p-3 min-h-[100px]"
            >
              <div className="relative shrink-0" style={{ width: platform.large ? '96px' : '56px', height: platform.large ? '96px' : '56px' }}>
                <Image src={platform.image} alt={platform.name} fill className="object-contain" />
              </div>
              {platform.label && platform.name === "GoTo Meeting" && (
                <span className="text-xs md:text-sm text-text-primary whitespace-nowrap">
                  <span className="font-bold">GoTo</span> Meeting
                </span>
              )}
              {platform.label && platform.name !== "GoTo Meeting" && (
                <span className="text-xs md:text-sm font-medium text-text-primary whitespace-nowrap">{platform.label}</span>
              )}
            </div>
          ))}
          <div className="bg-bg-surface-alt border border-border rounded-card flex flex-col items-center justify-center p-4 min-h-[100px]">
            <span className="text-sm font-semibold text-text-primary">&amp; More</span>
            <span className="text-xs text-text-muted">Coming Soon</span>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Seamless integration. No bots. No extra links. Just install and start your meeting.
        </p>
      </div>
    </section>
  );
}
