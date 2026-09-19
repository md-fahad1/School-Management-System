"use client";

import { useState } from "react";
import { FieldError } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hint?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hint,
  inputProps,
}: InputFieldProps) => {
  const isPassword = type === "password";
  const [show, setShow] = useState(false);
  const id = `field-${name}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-xs font-medium text-textSecondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          {...register(name)}
          aria-invalid={error ? true : undefined}
          className={`field ${isPassword ? "pr-10" : ""} ${error ? "field-error" : ""}`}
          {...inputProps}
          defaultValue={defaultValue}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error?.message ? (
        <p className="text-xs text-danger">{error.message.toString()}</p>
      ) : (
        hint && <p className="text-xs text-textMuted">{hint}</p>
      )}
    </div>
  );
};

export default InputField;