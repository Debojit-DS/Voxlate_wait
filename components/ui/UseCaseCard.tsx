import type { ComponentType } from "react";
import Image from "next/image";

type UseCaseCardProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  photoSrc: string;
  photoAlt: string;
  caption: string;
};

export function UseCaseCard({ icon: Icon, label, photoSrc, photoAlt, caption }: UseCaseCardProps) {
  return (
    <div className="rounded-card bg-surface border border-border overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image src={photoSrc} alt={photoAlt} fill className="object-contain bg-bg-surface-alt" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-3">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-white" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white drop-shadow">
              {label}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-text-secondary leading-relaxed">{caption}</p>
      </div>
    </div>
  );
}
