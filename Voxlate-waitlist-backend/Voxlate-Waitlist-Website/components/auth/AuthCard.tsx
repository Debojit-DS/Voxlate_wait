type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerPrompt: { text: string; linkText: string; href: string };
};

export function AuthCard({ title, subtitle, children, footerPrompt }: Props) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        <p className="mt-2 text-text-secondary text-sm">{subtitle}</p>
      </div>
      {children}
      <p className="mt-6 text-center text-sm text-text-secondary">
        {footerPrompt.text}{" "}
        <a href={footerPrompt.href} className="text-orange font-semibold hover:underline">
          {footerPrompt.linkText}
        </a>
      </p>
    </div>
  );
}
