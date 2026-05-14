"use client";

import { ReactNode } from "react";

interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}

export function Field({ label, type = "text", value, onChange, error, autoComplete, placeholder, required }: FieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className={`mt-1 w-full bg-bg border rounded-xl px-3 py-2.5 text-sm text-fg placeholder:text-muted/50 focus:outline-none transition-colors
          ${error ? "border-red-500/60 focus:border-red-500" : "border-line/15 focus:border-pitch/50"}`}
      />
      {error && <span className="text-[11px] text-red-400 mt-1 block">{error}</span>}
    </label>
  );
}

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-bg text-fg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-pitch text-bg shadow-[0_0_24px_-4px_rgba(0,177,64,0.6)] mb-3">
            <span className="text-2xl">🏆</span>
          </span>
          <h1 className="font-heading font-bold text-3xl text-fg">{title}</h1>
          {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="bg-surface border border-line/15 rounded-2xl p-6 shadow-lg shadow-black/30">
          {children}
        </div>
        {footer && <p className="text-center text-sm text-muted mt-6">{footer}</p>}
      </div>
    </main>
  );
}

export function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full bg-pitch hover:bg-accent text-bg font-heading font-bold py-3 rounded-xl text-sm transition-colors shadow-[0_0_24px_-8px_rgba(0,177,64,0.7)] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
