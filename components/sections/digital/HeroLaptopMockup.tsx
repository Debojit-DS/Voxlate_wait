import Image from "next/image";

export function HeroLaptopMockup() {
  return (
    <div className="relative">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src="/images/digital-hero-laptop.png"
          alt="Voxlate Digital real-time translation meeting interface"
          width={1200}
          height={800}
          className="h-auto w-full"
          priority
        />
      </div>
    </div>
  );
}
