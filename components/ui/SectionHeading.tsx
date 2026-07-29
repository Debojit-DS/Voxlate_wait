type SectionHeadingProps = {
  label: string;
};

export function SectionHeading({ label }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="block h-px w-6 bg-border md:w-10 shrink-0" />
      <span className="text-[13px] font-bold uppercase tracking-wider text-text-primary">
        {label}
      </span>
      <span className="block h-px w-6 bg-border md:w-10 shrink-0" />
    </div>
  );
}
