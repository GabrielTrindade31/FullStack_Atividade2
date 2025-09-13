import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  errors: Record<string, FieldError | undefined>;
  placeholder?: string;
  maxLength?: number;
};

export default function InputField({ label, name, register, errors, placeholder, maxLength }: Props) {
  const hasError = !!errors?.[name];
  const type = name === "email" ? "email" : "text";
  const inputMode = name === "email" ? "email" : "numeric";
  return (
    <div className="flex-1">
      <label className="block text-xs font-semibold tracking-widest text-gray-600 dark:text-neutral-300 mb-1">{label}</label>
      <input
        type={type}
        inputMode={inputMode as any}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2 text-lg outline-none focus:ring-2 bg-white dark:bg-neutral-800 ${
          hasError ? "border-red-500 ring-red-200" : "border-gray-300 dark:border-neutral-700 focus:ring-indigo-200"
        }`}
        {...register}
      />
      {hasError && <p className="mt-1 text-xs text-red-600 dark:text-red-300">{errors[name]?.message?.toString()}</p>}
    </div>
  );
}
