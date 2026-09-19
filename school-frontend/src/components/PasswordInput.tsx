"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Drop-in replacement for <input type="password" />.
 * Ekta chhoto "eye" button thake — click korle password dekha jay / lukano jay.
 */
const PasswordInput = ({ className = "", ...props }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`${className} pr-9`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-textMuted hover:text-textPrimary"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;