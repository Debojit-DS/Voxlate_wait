"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  id: string;
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
};

export function PasswordInput({ id, label, placeholder, registration, error }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Lock size={18} className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          className={`border rounded-input h-12 w-full bg-white pr-11 pl-10 text-sm outline-none transition-colors focus:border-orange focus:ring-2 focus:ring-orange/15 ${
            error ? "border-danger" : "border-border"
          }`}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-text-muted absolute top-1/2 right-3 -translate-y-1/2"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-danger mt-1 text-sm">{error}</p>}
    </div>
  );
}
