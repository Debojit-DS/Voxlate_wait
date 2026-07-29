import type { UseFormRegisterReturn } from "react-hook-form";

type InputProps = {
  id: string;
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

export function Input({ id, label, placeholder, registration, error, icon: Icon }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon size={18} className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2" />}
        <input
          id={id}
          placeholder={placeholder}
          className={`border rounded-input h-12 w-full bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-orange focus:ring-2 focus:ring-orange/15 ${
            error ? "border-danger" : "border-border"
          }`}
          {...registration}
        />
      </div>
      {error && <p className="text-danger mt-1 text-sm">{error}</p>}
    </div>
  );
}
