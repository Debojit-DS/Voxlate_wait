import Image from "next/image";
import { Button } from "@/components/ui/Button";

type ProductCardProps = {
  eyebrow: string;
  eyebrowIcon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onJoinWaitlist?: () => void;
  detailsHref?: string;
};

export function ProductCard({ eyebrow, eyebrowIcon: EyebrowIcon, title, description, imageSrc, imageAlt, onJoinWaitlist, detailsHref }: ProductCardProps) {
  return (
    <div className="rounded-card bg-surface p-6 md:p-8 border border-border">
      <div className="flex items-center gap-2 mb-5">
        {EyebrowIcon && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-cta text-white">
            <EyebrowIcon size={14} />
          </div>
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary">{eyebrow}</span>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-text-primary leading-tight mb-3">{title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">{description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <Button variant="outline-navy" href={detailsHref}>See Details</Button>
            <Button variant="primary-orange" onClick={onJoinWaitlist}>Join Waitlist</Button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-full aspect-[4/3] max-h-[320px] rounded-xl overflow-hidden">
            <Image src={imageSrc} alt={imageAlt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px" className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
