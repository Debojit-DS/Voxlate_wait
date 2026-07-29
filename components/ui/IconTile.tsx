type IconTileProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  iconSize?: number;
};

export function IconTile({ icon: Icon, label, iconSize = 32 }: IconTileProps) {
  return (
    <div className="flex flex-col items-center text-center rounded-card bg-bg-surface-alt border border-border p-4">
      <Icon size={iconSize} className="text-text-primary mb-2" />
      <span className="text-xs font-semibold text-text-primary leading-tight">{label}</span>
    </div>
  );
}
